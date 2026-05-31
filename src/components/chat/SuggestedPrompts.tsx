'use client';

import { Bot, FileText, FlaskConical, HeartPulse, Paperclip, ArrowRight, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Capability pills ──────────────────────────────────────────── */
const CAPABILITIES = [
  { icon: FileText,    label: 'Report Q&A',          color: 'bg-indigo-50  dark:bg-indigo-950/40 text-indigo-700  dark:text-indigo-300  border-indigo-200 dark:border-indigo-800'  },
  { icon: FlaskConical, label: 'Lab Value Explanations', color: 'bg-violet-50  dark:bg-violet-950/40 text-violet-700  dark:text-violet-300  border-violet-200 dark:border-violet-800'  },
  { icon: HeartPulse,  label: 'General Health Q&A',  color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
];

/* ── Suggested prompts ─────────────────────────────────────────── */
const SUGGESTIONS: { q: string; tag: string; tagColor: string }[] = [
  {
    q:        'What do high triglycerides mean and how can I lower them?',
    tag:      'Lipid Panel',
    tagColor: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  {
    q:        'My HbA1c is 6.1% — should I be concerned?',
    tag:      'Diabetes',
    tagColor: 'bg-amber-50  dark:bg-amber-950/40  text-amber-700  dark:text-amber-300  border-amber-200  dark:border-amber-800',
  },
  {
    q:        'Explain the difference between LDL and HDL cholesterol.',
    tag:      'Cholesterol',
    tagColor: 'bg-red-50    dark:bg-red-950/40    text-red-700    dark:text-red-300    border-red-200    dark:border-red-800',
  },
  {
    q:        'What does a low WBC count typically indicate?',
    tag:      'CBC',
    tagColor: 'bg-blue-50   dark:bg-blue-950/40   text-blue-700   dark:text-blue-300   border-blue-200   dark:border-blue-800',
  },
  {
    q:        'My TSH is slightly elevated. What does that mean for me?',
    tag:      'Thyroid',
    tagColor: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  },
  {
    q:        'What lifestyle changes can help improve my liver enzyme levels?',
    tag:      'Liver',
    tagColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
];

interface Props {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-start sm:justify-center min-h-full px-4 py-10 gap-8 overflow-y-auto">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200/70 dark:shadow-indigo-950">
          <Bot className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Health Assistant
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Ask questions about your medical reports or any health topic.
            Attach a report using the{' '}
            <Paperclip className="inline-block h-3.5 w-3.5 mb-0.5 text-slate-400" aria-label="paperclip" />{' '}
            icon below for context-aware, personalised answers.
          </p>
        </div>

        {/* Capability pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {CAPABILITIES.map(({ icon: Icon, label, color }) => (
            <span
              key={label}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold',
                color,
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Suggested prompts ─────────────────────────────────────── */}
      <div className="w-full max-w-2xl space-y-3">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Try asking
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTIONS.map(({ q, tag, tagColor }) => (
            <button
              key={q}
              onClick={() => onSelect(q)}
              className={cn(
                'group text-left px-4 py-3.5 rounded-xl',
                'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                'hover:border-indigo-300 dark:hover:border-indigo-600',
                'hover:shadow-md hover:shadow-indigo-50 dark:hover:shadow-indigo-950/30',
                'transition-all duration-200 space-y-2.5',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {q}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 shrink-0 mt-0.5 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <span className={cn(
                'inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                tagColor,
              )}>
                {tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Disclaimer footer ─────────────────────────────────────── */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm text-center leading-relaxed">
        <ShieldAlert className="inline-block h-3 w-3 text-amber-500 mr-1 mb-0.5" aria-hidden="true" />
        For informational purposes only. This assistant does not constitute medical advice.
        Always consult a qualified healthcare professional for any medical decision.
      </p>
    </div>
  );
}
