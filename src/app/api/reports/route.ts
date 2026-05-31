import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isDbEnabled } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json(
      { error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable history.' },
      { status: 503 }
    );
  }

  const supabase = getSupabase()!;

  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10')));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  try {
    const { data, error, count } = await supabase
      .from('reports')
      .select('id, file_name, file_type, file_size, uploaded_at, processed_at, status, report_type', { count: 'exact' })
      .eq('status', 'COMPLETED')
      .order('uploaded_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Transform snake_case → camelCase for the frontend
    const reports = (data ?? []).map((r) => ({
      id:          r.id,
      fileName:    r.file_name,
      fileType:    r.file_type,
      fileSize:    r.file_size,
      uploadedAt:  r.uploaded_at,
      processedAt: r.processed_at,
      status:      r.status,
      reportType:  r.report_type,
    }));

    return NextResponse.json({
      reports,
      pagination: {
        total:      count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports.' }, { status: 500 });
  }
}
