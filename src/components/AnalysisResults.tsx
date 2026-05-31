"use client"

import { AnalysisResult } from '@/types';
import FindingsCard from '@/components/FindingsCard';
import {
  FileText, Lightbulb, Heart, AlertTriangle,
  ShieldAlert, Info, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  result: AnalysisResult;
  fileName?: string;
}

/* ── Section wrappers ──────────────────────────────────────── */
function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm', className)}>
      {children}
    </div>
  );
}
function SectionHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60', className)}>
      {children}
    </div>
  );
}
function SectionBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

/* ── Status stat card ──────────────────────────────────────── */
function StatCard({
  label, count, bg, darkBg, numColor, darkNumColor, labelColor, darkLabelColor, border, darkBorder,
}: {
  label: string; count: number;
  bg: string; darkBg: string;
  numColor: string; darkNumColor: string;
  labelColor: string; darkLabelColor: string;
  border: string; darkBorder: string;
}) {
  if (!count) return null;
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-xl border px-4 py-3 min-w-[76px]',
      bg, darkBg, border, darkBorder,
    )}>
      <span className={cn('text-2xl font-extrabold leading-none tabular-nums', numColor, darkNumColor)}>
        {count}
      </span>
      <span className={cn('text-[11px] font-semibold mt-1.5 uppercase tracking-wide', labelColor, darkLabelColor)}>
        {label}
      </span>
    </div>
  );
}

export default function AnalysisResults({ result, fileName }: Props) {
  const hasRedFlags    = result.red_flags?.length > 0;
  const criticalCount  = result.key_findings?.filter((f) => f.status === 'critical').length ?? 0;
  const highCount      = result.key_findings?.filter((f) => f.status === 'high').length    ?? 0;
  const lowCount       = result.key_findings?.filter((f) => f.status === 'low').length     ?? 0;
  const normalCount    = result.key_findings?.filter((f) => f.status === 'normal').length  ?? 0;
  const abnormalCount  = criticalCount + highCount + lowCount;

  return (
    <div className="space-y-5">

      {/* ── Red flags ───────────────────────────────────────── */}
      {hasRedFlags && (
        <Section className="border-red-300 dark:border-red-800">
          <SectionHead className="bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-[18px] w-[18px] text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-red-700 dark:text-red-400 text-base">Red Flags — Needs Attention</h2>
              <p className="text-xs text-red-400 dark:text-red-500 mt-0.5">Review these with your doctor promptly</p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shrink-0">
              {result.red_flags.length}
            </span>
          </SectionHead>
          <SectionBody className="space-y-2.5">
            {result.red_flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl px-4 py-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-red-500 dark:text-red-400" aria-hidden="true" />
                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">{flag}</p>
              </div>
            ))}
          </SectionBody>
        </Section>
      )}

      {/* ── Overview ────────────────────────────────────────── */}
      <Section>
        <SectionHead>
          <div className="h-9 w-9 rounded-lg icon-bg-indigo flex items-center justify-center shrink-0">
            <FileText className="h-[18px] w-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">{result.report_type}</h2>
            {fileName && (
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5" title={fileName}>{fileName}</p>
            )}
          </div>
        </SectionHead>

        <SectionBody className="space-y-5">
          <p className="text-base text-slate-700 dark:text-slate-300 leading-7">{result.summary}</p>

          <div className="flex flex-wrap gap-2.5">
            <StatCard
              label="Critical" count={criticalCount}
              bg="bg-red-50"         darkBg="dark:bg-red-950/30"
              border="border-red-200"    darkBorder="dark:border-red-800"
              numColor="text-red-700"    darkNumColor="dark:text-red-400"
              labelColor="text-red-500"  darkLabelColor="dark:text-red-500"
            />
            <StatCard
              label="High" count={highCount}
              bg="bg-orange-50"          darkBg="dark:bg-orange-950/30"
              border="border-orange-200" darkBorder="dark:border-orange-800"
              numColor="text-orange-700" darkNumColor="dark:text-orange-400"
              labelColor="text-orange-500" darkLabelColor="dark:text-orange-500"
            />
            <StatCard
              label="Low" count={lowCount}
              bg="bg-blue-50"            darkBg="dark:bg-blue-950/30"
              border="border-blue-200"   darkBorder="dark:border-blue-800"
              numColor="text-blue-700"   darkNumColor="dark:text-blue-400"
              labelColor="text-blue-500" darkLabelColor="dark:text-blue-500"
            />
            <StatCard
              label="Normal" count={normalCount}
              bg="bg-emerald-50"             darkBg="dark:bg-emerald-950/30"
              border="border-emerald-200"    darkBorder="dark:border-emerald-800"
              numColor="text-emerald-700"    darkNumColor="dark:text-emerald-400"
              labelColor="text-emerald-500"  darkLabelColor="dark:text-emerald-500"
            />
            {abnormalCount === 0 && normalCount > 0 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  All values within normal range
                </span>
              </div>
            )}
          </div>
        </SectionBody>
      </Section>

      {/* ── Key Findings ────────────────────────────────────── */}
      {result.key_findings?.length > 0 && (
        <Section>
          <SectionHead>
            <div className="h-9 w-9 rounded-lg icon-bg-emerald flex items-center justify-center shrink-0">
              <TrendingUp className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Key Findings</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tap any row to expand the explanation</p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
              {result.key_findings.length} parameters
            </span>
          </SectionHead>
          <SectionBody className="px-4 py-3">
            <FindingsCard findings={result.key_findings} />
          </SectionBody>
        </Section>
      )}

      {/* ── Insights ────────────────────────────────────────── */}
      {result.insights?.length > 0 && (
        <Section>
          <SectionHead>
            <div className="h-9 w-9 rounded-lg icon-bg-amber flex items-center justify-center shrink-0">
              <Lightbulb className="h-[18px] w-[18px] text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">What This Means for You</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {result.insights.length} key takeaway{result.insights.length !== 1 ? 's' : ''}
              </p>
            </div>
          </SectionHead>
          <SectionBody className="space-y-3.5">
            {result.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800 mt-0.5"
                  aria-label={`Insight ${i + 1}`}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{insight}</p>
              </div>
            ))}
          </SectionBody>
        </Section>
      )}

      {/* ── Recommended Actions ─────────────────────────────── */}
      {result.recommended_actions?.length > 0 && (
        <Section>
          <SectionHead>
            <div className="h-9 w-9 rounded-lg icon-bg-rose flex items-center justify-center shrink-0">
              <Heart className="h-[18px] w-[18px] text-rose-600 dark:text-rose-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Recommended Actions</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Steps to discuss with your healthcare provider
              </p>
            </div>
          </SectionHead>
          <SectionBody className="space-y-2.5">
            {result.recommended_actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 px-4 py-3.5 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 hover:border-rose-100 dark:hover:border-rose-900 transition-colors duration-150"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800 mt-0.5"
                  aria-label={`Step ${i + 1}`}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{action}</p>
              </div>
            ))}
          </SectionBody>
        </Section>
      )}

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <div
        role="alert"
        className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4"
      >
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Medical Disclaimer: </strong>{result.disclaimer}
        </p>
      </div>

    </div>
  );
}
