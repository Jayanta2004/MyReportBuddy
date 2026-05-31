import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit } from '@/lib/rate-limiter';
import { processUploadedFile } from '@/lib/pdf-parser';
import { analyzeReport } from '@/lib/openai';
import { getSupabase, isDbEnabled } from '@/lib/supabase';
import { ProcessedFile } from '@/types';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE     = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILES         = 5;
const MAX_CONTEXT_LENGTH = 2000;             // chars for user description

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateCheck = await checkRateLimit(request);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Please wait ${Math.ceil((rateCheck.msBeforeNext ?? 60000) / 1000)} seconds.` },
      { status: 429 },
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data.' }, { status: 400 });
  }

  // Support both 'files' (multiple) and legacy 'file' (single)
  const rawFiles    = formData.getAll('files') as File[];
  const legacyFile  = formData.get('file') as File | null;
  const files       = rawFiles.length > 0 ? rawFiles : legacyFile ? [legacyFile] : [];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No file(s) provided.' }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Too many files. Maximum is ${MAX_FILES} files per submission.` },
      { status: 400 },
    );
  }

  // Get optional user context / symptom description
  const rawContext  = (formData.get('userContext') as string | null) ?? '';
  const userContext = rawContext.trim().substring(0, MAX_CONTEXT_LENGTH);

  // Validate each file
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `"${file.name}": Invalid type. Only PDF, JPG, PNG, WEBP allowed.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `"${file.name}": File exceeds 10 MB limit.` },
        { status: 400 },
      );
    }
    if (!file.name || file.name.length > 255) {
      return NextResponse.json({ error: 'One or more files have an invalid name.' }, { status: 400 });
    }
  }

  const reportId = uuidv4();

  try {
    // Process files entirely in memory — no disk writes
    const isMultiFile      = files.length > 1;
    const processedFiles: ProcessedFile[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer      = Buffer.from(arrayBuffer);
      const processed   = await processUploadedFile(buffer, file.type, file.name, isMultiFile);
      processedFiles.push(processed);
    }

    // Send processed files + user context to OpenAI
    const analysisResult = await analyzeReport(processedFiles, userContext || undefined);

    // Optional: persist to database
    let savedReportId: string | undefined;
    if (isDbEnabled()) {
      try {
        const supabase = getSupabase()!;
        const { data, error } = await supabase
          .from('reports')
          .insert({
            id:              reportId,
            file_name:       files.map((f) => f.name).join(', '),
            file_type:       files.length > 1 ? 'multiple' : files[0].type,
            file_size:       files.reduce((sum, f) => sum + f.size, 0),
            status:          'COMPLETED',
            processed_at:    new Date().toISOString(),
            analysis_result: analysisResult as unknown as Record<string, unknown>,
            report_type:     analysisResult.report_type,
          })
          .select('id')
          .single();

        if (error) throw error;
        savedReportId = data?.id;
      } catch (dbError) {
        console.error('DB save failed:', dbError);
      }
    }

    return NextResponse.json(
      { success: true, reportId: savedReportId ?? reportId, analysisResult },
      { status: 200 },
    );
  } catch (error) {
    console.error('Analysis error:', error);

    const message = error instanceof Error ? error.message : 'Analysis failed.';

    if (isDbEnabled()) {
      try {
        const supabase = getSupabase()!;
        await supabase.from('reports').insert({
          id:            reportId,
          file_name:     files.map((f) => f.name).join(', '),
          file_type:     files.length > 1 ? 'multiple' : (files[0]?.type ?? 'unknown'),
          file_size:     files.reduce((sum, f) => sum + f.size, 0),
          status:        'FAILED',
          error_message: message,
        });
      } catch { /* ignore */ }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
