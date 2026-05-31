import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { processUploadedFile } from '@/lib/pdf-parser';
import { ChatContextResponse } from '@/types/chat';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest): Promise<NextResponse<ChatContextResponse>> {
  const rateCheck = await checkRateLimit(request);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Rate limit exceeded.' },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Invalid form data.' },
      { status: 400 },
    );
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'No file provided.' },
      { status: 400 },
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'Invalid file type.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: 'File exceeds 10 MB.' },
      { status: 400 },
    );
  }

  try {
    // Process entirely in memory — no disk writes
    const buffer    = Buffer.from(await file.arrayBuffer());
    const processed = await processUploadedFile(buffer, file.type, file.name, false);

    // Images can't be re-read in the chat stream — surface a helpful message instead
    const content =
      processed.type === 'pdf'
        ? processed.content
        : `[Image-based report: ${file.name}. The AI will note context was provided but cannot re-read the image in chat — please paste key values manually or use the Analyze Report feature for full image analysis.]`;

    return NextResponse.json({
      success:  true,
      fileName: file.name,
      fileType: file.type,
      content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed.';
    return NextResponse.json(
      { success: false, fileName: '', fileType: '', content: '', error: message },
      { status: 500 },
    );
  }
}
