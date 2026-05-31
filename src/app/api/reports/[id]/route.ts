import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isDbEnabled } from '@/lib/supabase';
import { getSessionId } from '@/lib/session';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isDbEnabled()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'Invalid report ID.' }, { status: 400 });
  }

  const supabase = getSupabase()!;

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // Transform snake_case → camelCase
    const report = {
      id:             data.id,
      fileName:       data.file_name,
      fileType:       data.file_type,
      fileSize:       data.file_size,
      uploadedAt:     data.uploaded_at,
      processedAt:    data.processed_at,
      status:         data.status,
      analysisResult: data.analysis_result,
      reportType:     data.report_type,
      errorMessage:   data.error_message,
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: 'Failed to fetch report.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isDbEnabled()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'Invalid report ID.' }, { status: 400 });
  }

  // Require a valid session — without one we cannot verify ownership
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return NextResponse.json({ error: 'No active session.' }, { status: 403 });
  }

  const supabase = getSupabase()!;

  try {
    // The session_id filter ensures a user can only delete their own reports.
    // If the IDs don't match, 0 rows are affected and we still return success
    // (no information leak about whether the report ID exists).
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', params.id)
      .eq('session_id', sessionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Failed to delete report.' }, { status: 500 });
  }
}
