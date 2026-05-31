"use client"

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock, AlertCircle, Database, ChevronRight, UploadCloud, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ReportSummary {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
  reportType?: string;
}

/* Shimmer skeleton row */
function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/5 rounded-md shimmer" />
        <div className="h-3 w-1/3 rounded-md shimmer" />
      </div>
      <div className="h-8 w-24 rounded-lg shimmer shrink-0" />
    </div>
  );
}

/* Type-colour mapping for the badge */
function typeBadgeClass(type?: string) {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t.includes('blood') || t.includes('cbc')) return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
  if (t.includes('lipid') || t.includes('cholesterol')) return 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  if (t.includes('thyroid') || t.includes('tsh')) return 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
  if (t.includes('diabetes') || t.includes('hba1c')) return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  if (t.includes('liver') || t.includes('lft')) return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
}

export default function HistoryPage() {
  const [reports, setReports]       = useState<ReportSummary[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [dbAvailable, setDb]        = useState(true);
  const [confirmingId, setConfirming] = useState<string | null>(null);
  const [deletingId, setDeleting]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then(async (res) => {
        if (res.status === 503) { setDb(false); setLoading(false); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load history');
        setReports(data.reports ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    setConfirming(null);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Report deleted', description: 'The report has been removed from your history.' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="container px-4 py-10 max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">History</p>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Report History</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your previously analysed medical reports</p>
            </div>
            <Button asChild className="rounded-xl">
              <Link href="/upload">
                <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
                New Analysis
              </Link>
            </Button>
          </div>
        </div>

        <div className="container px-4 py-10 max-w-4xl mx-auto">

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3" aria-label="Loading reports">
              {[1,2,3].map((n) => <SkeletonRow key={n} />)}
            </div>
          )}

          {/* No DB */}
          {!loading && !dbAvailable && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-14 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Database className="h-8 w-8 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Database not configured</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                Report history requires a PostgreSQL database. Set{' '}
                <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">DATABASE_URL</code>{' '}
                and run{' '}
                <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">npm run db:push</code>.
              </p>
              <Button asChild variant="outline" className="rounded-xl mt-2">
                <Link href="/upload">Analyse a Report</Link>
              </Button>
            </div>
          )}

          {/* Error */}
          {!loading && dbAvailable && error && (
            <div className="flex items-center gap-3 text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-5 py-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && dbAvailable && !error && reports.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-14 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl icon-bg-indigo flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No reports yet</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Upload your first report to see your history here.</p>
              <Button asChild className="rounded-xl mt-2">
                <Link href="/upload">Analyse Your First Report</Link>
              </Button>
            </div>
          )}

          {/* Report list */}
          {!loading && reports.length > 0 && (
            <div className="space-y-3" aria-label="Report history list">
              {reports.map((report, i) => (
                <div
                  key={report.id}
                  className={cn(
                    'group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5',
                    'hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md hover:shadow-indigo-50 dark:hover:shadow-indigo-950/30 transition-all duration-200',
                    'animate-slide-up'
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="h-11 w-11 rounded-xl icon-bg-indigo flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate" title={report.fileName}>
                          {report.fileName}
                        </p>
                        {report.reportType && (
                          <span className={cn(
                            'text-xs font-medium px-2.5 py-0.5 rounded-full border',
                            typeBadgeClass(report.reportType)
                          )}>
                            {report.reportType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatDate(report.uploadedAt)}
                        </span>
                        <span>{formatFileSize(report.fileSize)}</span>
                        <span className="uppercase">{report.fileType.split('/')[1]}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {deletingId === report.id ? (
                        /* Deleting spinner */
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 px-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          Deleting…
                        </div>
                      ) : confirmingId === report.id ? (
                        /* Inline confirmation */
                        <div className="flex items-center gap-1.5 animate-scale-in">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-0.5">Delete?</span>
                          <button
                            onClick={() => setConfirming(null)}
                            aria-label="Cancel delete"
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            aria-label="Confirm delete"
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        /* Normal state */
                        <>
                          <button
                            onClick={() => setConfirming(report.id)}
                            aria-label={`Delete ${report.fileName}`}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all duration-150"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <Button asChild size="sm" variant="outline"
                            className="rounded-lg group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                            <Link href={`/results/${report.id}`}>
                              View
                              <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
