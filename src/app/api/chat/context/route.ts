import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit } from '@/lib/rate-limiter';
import { processUploadedFile } from '@/lib/pdf-parser';
import { sanitizeFilename } from '@/lib/utils';
import { ChatContextResponse } from '@/types/chat';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse<ChatContextResponse>> {
  const rateCheck = await checkRateLimit(request);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Invalid form data.' },
      { status: 400 }
    );
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'No file provided.' },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Invalid file type.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'File exceeds 10MB.' },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), 'uploads');
  const safeFileName = sanitizeFilename(file.name);
  const tempPath = path.join(uploadDir, `ctx_${uuidv4()}_${safeFileName}`);

  if (!tempPath.startsWith(uploadDir)) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Invalid path.' },
      { status: 400 }
    );
  }

  try {
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));

    const processed = await processUploadedFile(tempPath, file.type, file.name, false);

    // For image files that couldn't be text-extracted, just note it's an image report
    const content =
      processed.type === 'pdf'
        ? processed.content
        : `[Image-based report: ${file.name}. The AI will note context was provided but cannot re-read the image in chat — please paste key values manually or use the Analyze Report feature for full image analysis.]`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: file.type,
      content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed.';
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: message },
      { status: 500 }
    );
  } finally {
    unlink(tempPath).catch(() => {});
  }
}
