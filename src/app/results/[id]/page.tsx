import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalysisResults from '@/components/AnalysisResults';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/types';
import { Upload, FileText, Sparkles, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getSupabase, isDbEnabled } from '@/lib/supabase';
import DownloadPDFButton from '@/components/DownloadPDFButton';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Report ${params.id.slice(0, 8)} — MyReportBuddy`,
    description: 'View your AI-powered medical report analysis.',
  };
}

export default async function ReportPage({ params }: Props) {
  // If Supabase is not configured, fall back to session-storage preview
  if (!isDbEnabled()) {
    redirect('/results/preview');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) notFound();

  const supabase = getSupabase()!;
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !report) notFound();

  /* ── Failed state ───────────────────────────────────────────── */
  if (report.status === 'FAILED') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Analysis Failed</h1>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                {report.error_message ?? 'An error occurred during analysis. Please try again.'}
              </p>
            </div>
            <Button asChild className="rounded-xl">
              <Link href="/upload">Try Again</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const result = report.analysis_result as unknown as AnalysisResult;

  /* ── Success ────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="container px-4 py-8 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Left: icon + title + meta */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl icon-bg-indigo flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Analysis Results</h1>
                  {result?.report_type && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {result.report_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-[180px]">{report.file_name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {formatDate(report.uploaded_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <DownloadPDFButton result={result} fileName={report.file_name} />
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  New Analysis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results body */}
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-3xl mx-auto">
          <AnalysisResults result={result} fileName={report.file_name} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
