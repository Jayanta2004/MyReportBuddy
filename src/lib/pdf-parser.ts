import { ProcessedFile } from '@/types';

// Per-file token budget when multiple files are submitted
const SINGLE_FILE_CHAR_LIMIT = 12000;
const MULTI_FILE_CHAR_LIMIT  = 6000;

// ---------------------------------------------------------------------------
// Primary extractor — pdfjs-dist v3 legacy CJS build.
// Handles bad XRef tables, non-standard structures, and most edge cases that
// pdf-parse cannot recover from. Text extraction requires no canvas.
// ---------------------------------------------------------------------------
async function extractWithPdfjs(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const pdfjs = require('pdfjs-dist/legacy/build/pdf.js') as any;

    // Disable the browser worker — text extraction runs inline in Node.js
    pdfjs.GlobalWorkerOptions.workerSrc = '';

    const pdf = await pdfjs
      .getDocument({
        data:            new Uint8Array(buffer),
        useSystemFonts:  true,
        disableFontFace: true,
      })
      .promise;

    const numPages = Math.min(pdf.numPages, 50);
    const parts: string[] = [];

    for (let p = 1; p <= numPages; p++) {
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();
      const text    = (content.items as Array<{ str?: string }>)
        .map((item) => item.str ?? '')
        .join(' ');
      parts.push(text);
    }

    return parts.join('\n').trim();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Secondary extractor — pdf-parse (belt-and-braces fallback).
// ---------------------------------------------------------------------------
async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data     = await pdfParse(buffer, { max: 50 });
    return data.text.trim();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function processPDF(
  fileBuffer: Buffer,
  fileName:   string,
  charLimit = SINGLE_FILE_CHAR_LIMIT,
): Promise<ProcessedFile> {
  // Step 1 — try the robust pdfjs-dist extractor
  let text = await extractWithPdfjs(fileBuffer);

  // Step 2 — fall back to pdf-parse if pdfjs-dist returned nothing
  if (!text || text.length < 50) {
    text = await extractWithPdfParse(fileBuffer);
  }

  // Step 3 — we have usable text, truncate and return in text mode
  if (text && text.length >= 50) {
    const content = text.length > charLimit
      ? text.substring(0, charLimit) + '\n\n[Content truncated for analysis]'
      : text;
    return { type: 'pdf', content, mimeType: 'application/pdf', fileName };
  }

  // Step 4 — text extraction failed entirely (scanned / image-only PDF).
  // Return as 'image' type with raw PDF bytes so openai.ts can handle it
  // gracefully (it will send a text notice instead of calling the Vision API,
  // which does not accept application/pdf MIME type).
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
  return {
    type:    'image',
    content: fileBuffer.toString('base64'),
    mimeType,
    fileName,
  };
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
