import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* ── Types ─────────────────────────────────────────────────────── */
export interface DbReport {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  processed_at: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  analysis_result: Record<string, unknown> | null;
  report_type: string | null;
  error_message: string | null;
}

/* ── Singleton client ──────────────────────────────────────────── */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

/** Returns true when Supabase is fully configured */
export function isDbEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
