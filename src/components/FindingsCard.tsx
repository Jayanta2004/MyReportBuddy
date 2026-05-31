"use client"

import { KeyFinding, FindingStatus } from '@/types';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_ORDER: Record<FindingStatus, number> = {
  critical: 0, high: 1, low: 2, normal: 3,
};

const STATUS: Record<FindingStatus, {
  label:      string;
  row:        string;
  badge:      string;
  bar:        string;
  iconBg:     string;
  iconColor:  string;
  valueColor: string;
  rangeBg:    string;
  icon:       React.ElementType;
}> = {
  normal: {
    label:      'Normal',
    row:        'bg-white dark:bg-slate-900 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20',
    badge:      'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    bar:        'bg-emerald-400 dark:bg-emerald-600',
    iconBg:     'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor:  'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-700 dark:text-emerald-400',
    rangeBg:    'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    icon:       Minus,
  },
  high: {
    label:      'High',
    row:        'bg-orange-50/30 dark:bg-orange-950/10 hover:bg-orange-50/60 dark:hover:bg-orange-950/20',
    badge:      'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    bar:        'bg-orange-400 dark:bg-orange-600',
    iconBg:     'bg-orange-100 dark:bg-orange-900/50',
    iconColor:  'text-orange-600 dark:text-orange-400',
    valueColor: 'text-orange-700 dark:text-orange-400',
    rangeBg:    'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400',
    icon:       TrendingUp,
  },
  low: {
    label:      'Low',
    row:        'bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/60 dark:hover:bg-blue-950/20',
    badge:      'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    bar:        'bg-blue-400 dark:bg-blue-600',
    iconBg:     'bg-blue-100 dark:bg-blue-900/50',
    iconColor:  'text-blue-600 dark:text-blue-400',
    valueColor: 'text-blue-700 dark:text-blue-400',
    rangeBg:    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
    icon:       TrendingDown,
  },
  critical: {
    label:      'Critical',
    row:        'bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/70 dark:hover:bg-red-950/20',
    badge:      'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    bar:        'bg-red-500 dark:bg-red-600',
    iconBg:     'bg-red-100 dark:bg-red-900/50',
    iconColor:  'text-red-600 dark:text-red-400',
    valueColor: 'text-red-700 dark:text-red-400',
    rangeBg:    'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    icon:       AlertTriangle,
  },
};

interface Props { findings: KeyFinding[]; }

export default function FindingsCard({ findings }: Props) {
  if (!findings?.length) return null;

  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status]
  );

  return (
    <Accordion type="multiple" className="space-y-1.5">
      {sorted.map((finding, i) => {
        const cfg        = STATUS[finding.status] ?? STATUS.normal;
        const StatusIcon = cfg.icon;

        return (
          <AccordionItem
            key={`${finding.parameter}-${i}`}
            value={`finding-${i}`}
            className={cn(
              'border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-150',
              'flex flex-col',
              cfg.row
            )}
          >
            {/* ── Trigger row ──────────────────────────────── */}
            <AccordionTrigger className="hover:no-underline px-0 py-0 [&>svg]:hidden">
              <div className="flex items-stretch w-full text-left">

                {/* Left accent bar */}
                <div className={cn('w-1 shrink-0 rounded-l-xl', cfg.bar)} aria-hidden="true" />

                {/* Content */}
                <div className="flex items-center gap-3 flex-1 min-w-0 px-3.5 py-3">

                  {/* Status icon */}
                  <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', cfg.iconBg)}>
                    <StatusIcon className={cn('h-3.5 w-3.5', cfg.iconColor)} aria-hidden="true" />
                  </div>

                  {/* Parameter name */}
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex-1 min-w-0 truncate">
                    {finding.parameter}
                  </span>

                  {/* Value + badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-sm font-bold font-mono', cfg.valueColor)}>
                      {finding.value}
                    </span>
                    <span
                      className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', cfg.badge)}
                      aria-label={`Status: ${cfg.label}`}
                    >
                      {cfg.label}
                    </span>
                    {/* Chevron */}
                    <svg
                      className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 [[data-state=open]_&]:rotate-180"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            {/* ── Expanded content ─────────────────────────── */}
            <AccordionContent className="px-0 pb-0">
              <div className="ml-1 border-t border-slate-100 dark:border-slate-700 px-4 py-4 space-y-3 bg-white/80 dark:bg-slate-800/60">

                {/* Value comparison row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your value:</span>
                    <span className={cn(
                      'text-sm font-bold font-mono px-2.5 py-1 rounded-lg border',
                      cfg.rangeBg
                    )}>
                      {finding.value}
                    </span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 text-xs" aria-hidden="true">vs</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Normal range:</span>
                    <code className="text-sm px-2.5 py-1 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-mono">
                      {finding.normal_range}
                    </code>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {finding.explanation}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
