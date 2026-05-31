"use client"

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import {
  Upload, FileText, Image as ImageIcon, X, Loader2,
  AlertCircle, FilePlus2, MessageSquare, CheckCircle2,
  Sparkles, ChevronRight,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, formatFileSize, validateFile } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MAX_FILES = 5;

/* ── Uploading stage labels ──────────────────────────────────── */
const STAGES = [
  { until: 20, label: 'Uploading files…'               },
  { until: 50, label: 'Reading your report…'           },
  { until: 75, label: 'AI is analysing values…'        },
  { until: 90, label: 'Generating insights…'           },
  { until: 100, label: 'Almost done!'                  },
];
function stageLabel(pct: number) {
  return STAGES.find((s) => pct <= s.until)?.label ?? 'Finalising…';
}

/* ── Accepted type display label ─────────────────────────────── */
function typeLabel(mimeType: string) {
  if (mimeType === 'application/pdf') return 'PDF';
  return mimeType.split('/')[1]?.toUpperCase() ?? mimeType;
}

interface FileEntry {
  id: string;
  file: File;
  preview?: string;
}
function genId() { return Math.random().toString(36).slice(2); }

/* ════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function FileUpload() {
  const router = useRouter();
  const [entries, setEntries]       = useState<FileEntry[]>([]);
  const [userContext, setUserContext] = useState('');
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState<string | null>(null);

  /* ── Drop handler ─────────────────────────────────────────── */
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError(rejected[0].errors[0]?.message || 'One or more files are invalid.');
        return;
      }
      setEntries((prev) => {
        const remaining = MAX_FILES - prev.length;
        if (remaining <= 0) { setError(`Maximum ${MAX_FILES} files allowed.`); return prev; }
        const toAdd: FileEntry[] = [];
        for (const file of accepted.slice(0, remaining)) {
          const err = validateFile(file);
          if (err) { setError(err); continue; }
          const isDuplicate = prev.some((e) => e.file.name === file.name && e.file.size === file.size);
          if (!isDuplicate) {
            toAdd.push({
              id: genId(), file,
              preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            });
          }
        }
        return [...prev, ...toAdd];
      });
    }, []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    disabled: uploading,
  });

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.id !== id);
    });
    setError(null);
  };

  /* ── Upload + analyze ─────────────────────────────────────── */
  const handleUpload = async () => {
    if (entries.length === 0) return;
    setUploading(true);
    setError(null);
    setProgress(10);

    const formData = new FormData();
    for (const entry of entries) formData.append('files', entry.file);
    if (userContext.trim()) formData.append('userContext', userContext.trim());

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 7, 88));
    }, 900);

    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setProgress(96);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Upload failed (${response.status})`);
      setProgress(100);
      toast({ title: '✓ Analysis complete!', description: 'Redirecting to your results…' });
      sessionStorage.setItem('analysisResult', JSON.stringify(data));
      sessionStorage.setItem('reportFileName', entries.map((e) => e.file.name).join(', '));
      setTimeout(() => {
        router.push(data.reportId ? `/results/${data.reportId}` : '/results/preview');
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const canAddMore = entries.length < MAX_FILES && !uploading;
  const hasFiles   = entries.length > 0;

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="w-full space-y-5">

      {/* ── Drop zone ─────────────────────────────────────────── */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDragActive
            ? 'border-primary bg-primary/5 animate-drop-pulse scale-[1.01]'
            : canAddMore
            ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed opacity-60'
        )}
        aria-label={
          canAddMore
            ? hasFiles
              ? `${entries.length} of ${MAX_FILES} files added. Drop more or click to add.`
              : 'Drop files here or click to browse.'
            : `Maximum ${MAX_FILES} files reached.`
        }
      >
        <input {...getInputProps()} aria-label="File input" />

        {/* Empty state */}
        {!hasFiles && !isDragActive && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Upload className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Drop your report here
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              or <span className="text-primary font-medium underline underline-offset-2">click to browse</span>
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {['PDF', 'JPG', 'PNG', 'WEBP'].map((t) => (
                <span key={t} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
                  {t}
                </span>
              ))}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
                Max 10 MB
              </span>
            </div>
          </div>
        )}

        {/* Drag active overlay */}
        {isDragActive && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <FilePlus2 className="h-12 w-12 text-primary mb-3 animate-bounce" aria-hidden="true" />
            <p className="font-semibold text-primary text-lg">Release to add files</p>
          </div>
        )}

        {/* Has files — compact add-more strip */}
        {hasFiles && !isDragActive && (
          <div className={cn(
            'flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium',
            canAddMore ? 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
          )}>
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            {canAddMore
              ? `Add more files (${entries.length} / ${MAX_FILES})`
              : `Maximum ${MAX_FILES} files reached`}
          </div>
        )}
      </div>

      {/* ── File list ─────────────────────────────────────────── */}
      {hasFiles && (
        <ul className="space-y-2.5" aria-label="Selected files">
          {entries.map((entry, idx) => {
            const isPDF = entry.file.type === 'application/pdf';
            const FileIcon = isPDF ? FileText : ImageIcon;

            return (
              <li
                key={entry.id}
                className="animate-bounce-in flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-150"
              >
                {/* Thumbnail / icon */}
                {entry.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.preview}
                    alt={`Preview of ${entry.file.name}`}
                    className="h-11 w-11 object-cover rounded-lg border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className={cn(
                    'h-11 w-11 flex items-center justify-center rounded-lg shrink-0',
                    isPDF ? 'icon-bg-indigo' : 'icon-bg-emerald'
                  )}>
                    <FileIcon className={cn('h-5 w-5', isPDF ? 'text-indigo-600' : 'text-emerald-600')} aria-hidden="true" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shrink-0">
                      #{idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={entry.file.name}>
                      {entry.file.name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{formatFileSize(entry.file.size)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                    <span>{typeLabel(entry.file.type)}</span>
                  </p>
                </div>

                {/* Remove */}
                {!uploading && (
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    aria-label={`Remove ${entry.file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Progress bar ──────────────────────────────────────── */}
      {uploading && (
        <div className="space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
              {stageLabel(progress)}
            </span>
            <span className="font-semibold text-primary tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" aria-label={`Analysis progress: ${progress}%`} />
          <p className="text-xs text-slate-400 text-center">
            GPT-4o Vision is reading your report — usually under 20 seconds
          </p>
        </div>
      )}

      {/* ── Symptoms / context ─────────────────────────────────── */}
      {hasFiles && !uploading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <label
            htmlFor="user-context"
            className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            <div className="h-6 w-6 rounded-md icon-bg-violet flex items-center justify-center shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
            </div>
            Describe your symptoms or concern
            <span className="text-xs font-normal text-slate-400 ml-auto">Optional</span>
          </label>
          <textarea
            id="user-context"
            value={userContext}
            onChange={(e) => setUserContext(e.target.value.slice(0, 2000))}
            disabled={uploading}
            rows={3}
            maxLength={2000}
            placeholder="e.g. I've been feeling tired lately. My doctor ordered these tests. I'm 35 with no prior conditions — are there any values I should watch?"
            className={cn(
              'w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:bg-white dark:focus:bg-slate-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all'
            )}
            aria-describedby="user-context-hint"
          />
          <p id="user-context-hint" className="flex justify-between text-xs text-slate-400">
            <span>Adding context helps the AI personalise your insights.</span>
            <span className={cn('tabular-nums', userContext.length > 1800 ? 'text-orange-500 font-medium' : '')}>
              {userContext.length} / 2000
            </span>
          </p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3.5"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
          <div>
            <p className="font-medium">Upload error</p>
            <p className="text-red-600/80 dark:text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      {hasFiles && !uploading && (
        <button
          onClick={handleUpload}
          className="btn-gradient w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5"
          aria-label={entries.length === 1 ? 'Analyze report' : `Analyze ${entries.length} reports together`}
        >
          {entries.length === 1 ? (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Analyze Report
              <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Analyze {entries.length} Reports Together
              <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
            </>
          )}
        </button>
      )}

      {/* ── Uploading button (disabled) ─────────────────────── */}
      {uploading && (
        <button
          disabled
          className="btn-gradient w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5"
          aria-busy="true"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Analysing your report{entries.length > 1 ? 's' : ''}…
        </button>
      )}

      {/* ── What you'll get — shown before files ────────────── */}
      {!hasFiles && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: CheckCircle2, text: 'Plain-language summary',  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { icon: CheckCircle2, text: 'Colour-coded findings',   color: 'text-indigo-600  dark:text-indigo-400',  bg: 'bg-indigo-50  dark:bg-indigo-950/20'  },
            { icon: CheckCircle2, text: 'Actionable insights',     color: 'text-violet-600  dark:text-violet-400',  bg: 'bg-violet-50  dark:bg-violet-950/20'  },
            { icon: CheckCircle2, text: 'Downloadable PDF report', color: 'text-amber-600   dark:text-amber-400',   bg: 'bg-amber-50   dark:bg-amber-950/20'   },
          ].map(({ icon: Icon, text, color, bg }) => (
            <div key={text} className={cn('flex items-center gap-2 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-700', bg)}>
              <Icon className={cn('h-4 w-4 shrink-0', color)} aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
