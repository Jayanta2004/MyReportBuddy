"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalysisResults from '@/components/AnalysisResults';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/types';
import { Upload, Loader2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import DownloadPDFButton from '@/components/DownloadPDFButton';
import Link from 'next/link';

export default function PreviewResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    const name = sessionStorage.getItem('reportFileName') ?? '';

    if (!stored) {
      router.replace('/upload');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setResult(parsed.analysisResult ?? parsed);
      setFileName(name);
    } catch {
      router.replace('/upload');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* ── Loading state ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl icon-bg-indigo flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" aria-label="Loading results" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Loading your results…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── No result ──────────────────────────────────────────────── */
  if (!result) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-slate-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">No results found</h1>
              <p className="text-slate-500 text-sm mt-1">Please upload a report first to see analysis results.</p>
            </div>
            <Button asChild className="rounded-xl">
              <Link href="/upload">Upload Report</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Main results ───────────────────────────────────────────── */
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
                  {result.report_type && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {result.report_type}
                    </span>
                  )}
                </div>
                {fileName && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
                    <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{fileName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <DownloadPDFButton result={result} fileName={fileName} />
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
          <AnalysisResults result={result} fileName={fileName} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
