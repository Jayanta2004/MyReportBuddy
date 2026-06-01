import { ProcessedFile } from '@/types';
import { inflateSync, inflateRawSync } from 'zlib';

// Per-file token budget when multiple files are submitted
const SINGLE_FILE_CHAR_LIMIT = 12000;
const MULTI_FILE_CHAR_LIMIT  = 6000;

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Decode PDF literal-string escape sequences to plain text. */
function decodePdfLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, '\t')
    // Octal escape \ddd
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 && code < 127 ? String.fromCharCode(code) : ' ';
    })
    .replace(/\\\\/g, '\x01BKSL\x01')   // protect \\
    .replace(/\\(.)/g, '$1')
    .replace(/\x01BKSL\x01/g, '\\');
}

/**
 * Extract text from a single uncompressed PDF content stream.
 * Only reads inside BT … ET blocks — this excludes font definitions,
 * encoding tables, and all non-text metadata.
 */
function parseStreamText(data: string): string[] {
  const out: string[] = [];
  const LITERAL = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
  const btEt    = /BT\b([\s\S]*?)\bET\b/g;
  let block: RegExpExecArray | null;

  while ((block = btEt.exec(data)) !== null) {
    const body = block[1];

    // (text) Tj | (text) ' | (text) "
    const simple = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*(?:Tj|'|")/g;
    let m: RegExpExecArray | null;
    while ((m = simple.exec(body)) !== null) {
      const s = decodePdfLiteral(m[1]).trim();
      if (s) out.push(s);
    }

    // [(text) n (text)] TJ
    const tjRe = /\[([^\]]*)\]\s*TJ/g;
    while ((m = tjRe.exec(body)) !== null) {
      LITERAL.lastIndex = 0;
      let lit: RegExpExecArray | null;
      while ((lit = LITERAL.exec(m[1])) !== null) {
        const s = decodePdfLiteral(lit[1]).trim();
        if (s) out.push(s);
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 1 — /Length-based stream extractor  (Node.js zlib only, zero deps)
//
// Reads the /Length integer from each stream dictionary and slices exactly
// that many bytes from the buffer — avoids the problem where a regex can
// accidentally match "endstream" bytes inside compressed binary data.
// Decompresses FlateDecode streams with the built-in zlib module.
// ─────────────────────────────────────────────────────────────────────────────
async function extractBuiltin(buffer: Buffer): Promise<string> {
  try {
    // latin1 preserves raw byte values 0x00–0xFF (1 byte = 1 char)
    const raw   = buffer.toString('latin1');
    const parts: string[] = [];

    // Locate every "stream\n" or "stream\r\n" marker
    const markerRe = /stream\r?\n/g;
    let m: RegExpExecArray | null;

    while ((m = markerRe.exec(raw)) !== null) {
      // Find the /Length integer in the preceding dict (look back 512 chars)
      const prelude = raw.slice(Math.max(0, m.index - 512), m.index);

      const lenMatch = /\/Length\s+(\d+)/.exec(prelude);
      if (!lenMatch) continue;

      const streamLen = parseInt(lenMatch[1], 10);
      if (!streamLen || streamLen <= 0) continue;

      // Slice exactly /Length bytes from the buffer (not the string)
      // latin1 is 1-byte-per-char so string index === buffer byte index
      const contentStart = m.index + m[0].length;
      const streamBytes  = buffer.slice(contentStart, contentStart + streamLen);

      const isFlate = /\/FlateDecode/.test(prelude) ||
                      /\/Filter\s*\/Fl/.test(prelude);

      let content: string;
      if (isFlate) {
        try       { content = inflateSync(streamBytes).toString('latin1'); }
        catch     {
          try     { content = inflateRawSync(streamBytes).toString('latin1'); }
          catch   { continue; }
        }
      } else {
        content = streamBytes.toString('latin1');
      }

      parts.push(...parseStreamText(content));
    }

    return parts.join(' ').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 2 — Raw BT/ET scan  (zero deps, catches uncompressed content)
//
// Scans the raw PDF binary for BT … ET blocks.
// By limiting extraction to BT/ET blocks (not ALL "(string)" tokens),
// we avoid picking up font definitions, encoding tables, or other metadata
// that would produce garbage text and confuse the AI.
// ─────────────────────────────────────────────────────────────────────────────
async function extractRawBtEt(buffer: Buffer): Promise<string> {
  try {
    const raw   = buffer.toString('latin1');
    const parts = parseStreamText(raw);   // reuses BT/ET-only logic
    return parts.join(' ').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 3 — pdfjs-dist v3  (handles malformed XRef, complex PDFs)
// ─────────────────────────────────────────────────────────────────────────────
async function extractWithPdfjs(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod   = await import('pdfjs-dist/legacy/build/pdf.js') as any;
    const pdfjs = mod.default ?? mod;
    if (typeof pdfjs?.getDocument !== 'function') return '';

    pdfjs.GlobalWorkerOptions.workerSrc = '';
    const pdf  = await pdfjs
      .getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, disableFontFace: true })
      .promise;

    const pages: string[] = [];
    for (let p = 1; p <= Math.min(pdf.numPages, 50); p++) {
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();
      pages.push(
        (content.items as Array<{ str?: string }>).map((i) => i.str ?? '').join(' '),
      );
    }
    return pages.join('\n').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 4 — pdf-parse  (original library, last resort)
// ─────────────────────────────────────────────────────────────────────────────
async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data     = await pdfParse(buffer, { max: 50 });
    return data.text.trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function processPDF(
  fileBuffer: Buffer,
  fileName:   string,
  charLimit = SINGLE_FILE_CHAR_LIMIT,
): Promise<ProcessedFile> {
  // Try each layer in order; stop as soon as one yields ≥ 50 meaningful chars
  const layers = [
    extractBuiltin,       // /Length-based, zlib — reliable on any Node.js env
    extractRawBtEt,       // BT/ET scan on raw binary — catches uncompressed text
    extractWithPdfjs,     // pdfjs-dist — robust XRef recovery
    extractWithPdfParse,  // pdf-parse — legacy fallback
  ];

  let text = '';
  for (const extract of layers) {
    text = await extract(fileBuffer);
    if (text && text.length >= 50) break;
  }

  if (text && text.length >= 50) {
    const content = text.length > charLimit
      ? text.substring(0, charLimit) + '\n\n[Content truncated for analysis]'
      : text;
    return { type: 'pdf', content, mimeType: 'application/pdf', fileName };
  }

  // All layers failed — scanned / image-only PDF.
  // openai.ts sends a graceful text notice rather than crashing the Vision API.
  return {
    type:     'image',
    content:  fileBuffer.toString('base64'),
    mimeType: 'application/pdf',
    fileName,
  };
}

export async function processImage(
  fileBuffer: Buffer,
  mimeType:   string,
  fileName:   string,
): Promise<ProcessedFile> {
  return { type: 'image', content: fileBuffer.toString('base64'), mimeType, fileName };
}

export async function processUploadedFile(
  fileBuffer: Buffer,
  mimeType:   string,
  fileName:   string,
  isMultiFile = false,
): Promise<ProcessedFile> {
  const charLimit = isMultiFile ? MULTI_FILE_CHAR_LIMIT : SINGLE_FILE_CHAR_LIMIT;
  if (mimeType === 'application/pdf') return processPDF(fileBuffer, fileName, charLimit);
  if (mimeType.startsWith('image/'))  return processImage(fileBuffer, mimeType, fileName);
  throw new Error(`Unsupported file type: ${mimeType}`);
}
