import { ProcessedFile } from '@/types';

// Per-file token budget when multiple files are submitted
const SINGLE_FILE_CHAR_LIMIT = 12000;
const MULTI_FILE_CHAR_LIMIT  = 6000;

export async function processPDF(
  fileBuffer: Buffer,
  fileName:  string,
  charLimit = SINGLE_FILE_CHAR_LIMIT,
): Promise<ProcessedFile> {
  // Dynamic import to avoid issues with server-side rendering
  const pdfParse = (await import('pdf-parse')).default;

  try {
    const data          = await pdfParse(fileBuffer, { max: 50 });
    const extractedText = data.text.trim();

    if (!extractedText || extractedText.length < 50) {
      // Scanned / image-based PDF — fall back to vision
      return {
        type:     'image',
        content:  fileBuffer.toString('base64'),
        mimeType: 'application/pdf',
        fileName,
      };
    }

    const truncated =
      extractedText.length > charLimit
        ? extractedText.substring(0, charLimit) + '\n\n[Content truncated for analysis]'
        : extractedText;

    return { type: 'pdf', content: truncated, mimeType: 'application/pdf', fileName };
  } catch (err) {
    throw new Error(
      `Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}`,
    );
  }
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
