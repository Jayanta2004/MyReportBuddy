import { ProcessedFile } from '@/types';
import { inflateSync, inflateRawSync } from 'zlib';

// Per-file token budget when multiple files are submitted
const SINGLE_FILE_CHAR_LIMIT = 12000;
const MULTI_FILE_CHAR_LIMIT  = 6000;

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Decode PDF literal-string escape sequences into readable text. */
function decodePdfLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, '\t')
    // Octal escapes like \101 → 'A'
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 && code < 127 ? String.fromCharCode(code) : ' ';
    })
    .replace(/\\\\/g, '\\')
    .replace(/\\(.)/g, '$1');
}

/** True if a decoded PDF string looks like real text (not binary noise). */
function looksLikeText(s: string): boolean {
  if (s.length < 3) return false;
  const printable = s.split('').filter(
    (c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127,
  ).length;
  return printable / s.length > 0.6 && /[a-zA-Z0-9]/.test(s);
}

/** Extract text items from a single content stream (BT…ET operators). */
function parseStreamText(data: string): string[] {
  const out: string[] = [];
  const LITERAL = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
  const btEt    = /BT\b([\s\S]*?)\bET\b/g;
  let block: RegExpExecArray | null;

  while ((block = btEt.exec(data)) !== null) {
    const body = block[1];

    // (text) Tj | (text) ' | (text) "
    const simpleRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*(?:Tj|'|")/g;
    let m: RegExpExecArray | null;
    while ((m = simpleRe.exec(body)) !== null) {
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
// Layer 1 — Stream-based extractor (Node.js zlib, zero external deps)
//
// Locates every stream/endstream block, decompresses FlateDecode streams,
// then extracts text from BT…ET operators.
// Handles all line-ending variants (\n, \r\n, \r).
// ─────────────────────────────────────────────────────────────────────────────
async function extractBuiltin(buffer: Buffer): Promise<string> {
  try {
    const raw  = buffer.toString('latin1');
    const parts: string[] = [];

    // Flexible line endings: stream may end with \n, \r\n, or \r
    const streamRe = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let m: RegExpExecArray | null;

    while ((m = streamRe.exec(raw)) !== null) {
      // Look back up to 512 chars to find /Filter entry in the dict
      const prelude  = raw.slice(Math.max(0, m.index - 512), m.index);
      const rawBytes = Buffer.from(m[1], 'latin1');

      const isFlate  = /\/FlateDecode/.test(prelude) ||
                       /\/Filter\s*\/Fl/.test(prelude);

      let content: string;
      if (isFlate) {
        try       { content = inflateSync(rawBytes).toString('latin1'); }
        catch     {
          try     { content = inflateRawSync(rawBytes).toString('latin1'); }
          catch   { continue; }
        }
      } else {
        content = rawBytes.toString('latin1');
      }

      parts.push(...parseStreamText(content));
    }

    return parts.join(' ').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 2 — Raw literal-string scan (ultimate fallback, zero deps)
//
// Scans the ENTIRE PDF binary for every (text) token — no stream structure
// required.  Works for any uncompressed content regardless of XRef table
// validity, stream format, or producer.  Filters out binary noise by checking
// the ratio of printable ASCII characters.
// ─────────────────────────────────────────────────────────────────────────────
async function extractRawScan(buffer: Buffer): Promise<string> {
  try {
    const raw  = buffer.toString('latin1');
    const parts: string[] = [];

    // Match all PDF literal strings: (anything not unescaped-closing-paren)
    const re = /\(([^)\\]{2,}(?:\\.[^)\\]*)*)\)/g;
    let m: RegExpExecArray | null;

    while ((m = re.exec(raw)) !== null) {
      const decoded = decodePdfLiteral(m[1]).trim();
      if (looksLikeText(decoded)) parts.push(decoded);
    }

    return parts.join(' ').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 3 — pdfjs-dist v3  (handles malformed XRef, complex PDFs)
// Dynamic import works in both CJS dev mode and ESM Vercel production.
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
// Layer 4 — pdf-parse (original library, last resort)
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
  // Try each layer in order; stop as soon as one yields ≥ 50 chars
  const layers = [extractBuiltin, extractRawScan, extractWithPdfjs, extractWithPdfParse];

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
  // openai.ts sends a graceful notice instead of crashing the Vision API.
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
  if (mimeType === 'application/pdf')  return processPDF(fileBuffer, fileName, charLimit);
  if (mimeType.startsWith('image/'))   return processImage(fileBuffer, mimeType, fileName);
  throw new Error(`Unsupported file type: ${mimeType}`);
}
