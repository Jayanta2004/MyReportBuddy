import { ProcessedFile } from '@/types';
import { inflateSync, inflateRawSync } from 'zlib';

// Per-file token budget when multiple files are submitted
const SINGLE_FILE_CHAR_LIMIT = 12000;
const MULTI_FILE_CHAR_LIMIT  = 6000;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Decode PDF literal string escape sequences into plain text. */
function decodePdfLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\x00BACKSLASH\x00')          // protect escaped backslash
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 && code < 127 ? String.fromCharCode(code) : ' ';
    })
    .replace(/\\(.)/g, '$1')
    .replace(/\x00BACKSLASH\x00/g, '\\');
}

/** Extract visible text strings from a single PDF content stream. */
function parseStreamText(stream: string): string[] {
  const parts: string[] = [];
  const LITERAL_RE = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;

  const btEtRe = /BT\b([\s\S]*?)\bET\b/g;
  let block: RegExpExecArray | null;

  while ((block = btEtRe.exec(stream)) !== null) {
    const body = block[1];

    // Simple: (text) Tj | (text) ' | (text) "
    const simpleRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*(?:Tj|'|")/g;
    let m: RegExpExecArray | null;
    while ((m = simpleRe.exec(body)) !== null) {
      const s = decodePdfLiteral(m[1]).trim();
      if (s) parts.push(s);
    }

    // Array: [(text) n (text) ...] TJ
    const tjRe = /\[([^\]]*)\]\s*TJ/g;
    while ((m = tjRe.exec(body)) !== null) {
      LITERAL_RE.lastIndex = 0;
      let lit: RegExpExecArray | null;
      while ((lit = LITERAL_RE.exec(m[1])) !== null) {
        const s = decodePdfLiteral(lit[1]).trim();
        if (s) parts.push(s);
      }
    }
  }

  return parts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Extractor 1 — Built-in (Node.js zlib only, zero external deps)
//
// Scans every stream/endstream block in the PDF binary, decompresses
// FlateDecode streams with the built-in zlib module, then extracts
// text from BT…ET operators.
//
// This works in all environments including Vercel serverless functions
// because it uses only Node.js built-ins — nothing gets webpack-bundled.
// ─────────────────────────────────────────────────────────────────────────────
async function extractBuiltin(buffer: Buffer): Promise<string> {
  try {
    // Latin-1 encoding preserves raw byte values (0x00–0xFF) correctly
    const raw      = buffer.toString('latin1');
    const allParts: string[] = [];

    // Locate every stream…endstream block.
    // Look back up to 600 chars before "stream" to find the /Filter entry.
    const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let m: RegExpExecArray | null;

    while ((m = streamRe.exec(raw)) !== null) {
      const prelude  = raw.slice(Math.max(0, m.index - 600), m.index);
      const rawBytes = Buffer.from(m[1], 'latin1');

      const isFlate  = /\/FlateDecode/.test(prelude) ||
                       /\/Filter\s*\/Fl/.test(prelude);

      let streamText: string;

      if (isFlate) {
        // PDF FlateDecode = zlib format (inflate) with raw-deflate as fallback
        try {
          streamText = inflateSync(rawBytes).toString('latin1');
        } catch {
          try {
            streamText = inflateRawSync(rawBytes).toString('latin1');
          } catch {
            continue; // unreadable compressed stream — skip
          }
        }
      } else {
        streamText = rawBytes.toString('latin1');
      }

      allParts.push(...parseStreamText(streamText));
    }

    return allParts.join(' ').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Extractor 2 — pdfjs-dist v3 (handles malformed XRef, non-standard PDFs)
// Uses dynamic import so it works in both CJS (dev) and ESM (Vercel prod).
// ─────────────────────────────────────────────────────────────────────────────
async function extractWithPdfjs(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod   = await import('pdfjs-dist/legacy/build/pdf.js') as any;
    const pdfjs = mod.default ?? mod;

    if (typeof pdfjs?.getDocument !== 'function') return '';

    pdfjs.GlobalWorkerOptions.workerSrc = '';

    const pdf = await pdfjs
      .getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, disableFontFace: true })
      .promise;

    const numPages = Math.min(pdf.numPages, 50);
    const parts: string[] = [];

    for (let p = 1; p <= numPages; p++) {
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();
      const text    = (content.items as Array<{ str?: string }>)
        .map((item) => item.str ?? '').join(' ');
      parts.push(text);
    }

    return parts.join('\n').trim();
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Extractor 3 — pdf-parse (original fallback)
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
  // Run all three extractors in priority order, stop as soon as one succeeds
  let text = await extractBuiltin(fileBuffer);

  if (!text || text.length < 50) {
    text = await extractWithPdfjs(fileBuffer);
  }

  if (!text || text.length < 50) {
    text = await extractWithPdfParse(fileBuffer);
  }

  if (text && text.length >= 50) {
    const content = text.length > charLimit
      ? text.substring(0, charLimit) + '\n\n[Content truncated for analysis]'
      : text;
    return { type: 'pdf', content, mimeType: 'application/pdf', fileName };
  }

  // All extractors failed — scanned / image-only PDF.
  // openai.ts sends a graceful text notice instead of calling Vision API.
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

  if (mimeType === 'application/pdf') {
    return processPDF(fileBuffer, fileName, charLimit);
  } else if (mimeType.startsWith('image/')) {
    return processImage(fileBuffer, mimeType, fileName);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
