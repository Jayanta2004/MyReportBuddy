import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isDbEnabled } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isDbEnabled()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isDbEnabled()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'Invalid report ID.' }, { status: 400 });
  }

  const supabase = getSupabase()!;

  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Failed to delete report.' }, { status: 500 });
  }
}
