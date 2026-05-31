import { ProcessedFile } from '@/types';
import fs from 'fs';

// Per-file token budget when multiple files are submitted
const SINGLE_FILE_CHAR_LIMIT = 12000;
const MULTI_FILE_CHAR_LIMIT = 6000;

export async function processPDF(
  filePath: string,
  fileName: string,
  charLimit = SINGLE_FILE_CHAR_LIMIT
): Promise<ProcessedFile> {
  const fileBuffer = fs.readFileSync(filePath);

  // Dynamic import to avoid issues with server-side rendering
  const pdfParse = (await import('pdf-parse')).default;

  try {
    const data = await pdfParse(fileBuffer, { max: 50 });
    const extractedText = data.text.trim();

    if (!extractedText || extractedText.length < 50) {
      // Scanned / image-based PDF — fall back to vision
      const base64 = fileBuffer.toString('base64');
      return { type: 'image', content: base64, mimeType: 'application/pdf', fileName };
    }

    const truncated =
      extractedText.length > charLimit
        ? extractedText.substring(0, charLimit) + '\n\n[Content truncated for analysis]'
        : extractedText;

    return { type: 'pdf', content: truncated, mimeType: 'application/pdf', fileName };
  } catch (err) {
    throw new Error(`Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function processImage(
  filePath: string,
  mimeType: string,
  fileName: string
): Promise<ProcessedFile> {
  const fileBuffer = fs.readFileSync(filePath);
  return { type: 'image', content: fileBuffer.toString('base64'), mimeType, fileName };
}

export async function processUploadedFile(
  filePath: string,
  mimeType: string,
  fileName: string,
  isMultiFile = false
): Promise<ProcessedFile> {
  const charLimit = isMultiFile ? MULTI_FILE_CHAR_LIMIT : SINGLE_FILE_CHAR_LIMIT;

  if (mimeType === 'application/pdf') {
    return processPDF(filePath, fileName, charLimit);
  } else if (mimeType.startsWith('image/')) {
    return processImage(filePath, mimeType, fileName);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
