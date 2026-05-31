'use client';

import { Sparkles, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  { q: 'What do high triglycerides mean and how can I lower them?',     tag: 'Lipid Panel' },
  { q: 'My HbA1c is 6.1% — should I be concerned?',                    tag: 'Diabetes'    },
  { q: 'Explain the difference between LDL and HDL cholesterol.',        tag: 'Cholesterol' },
  { q: 'What does a low WBC count typically indicate?',                  tag: 'CBC'         },
  { q: 'My TSH is slightly elevated. What does that mean for me?',       tag: 'Thyroid'     },
  { q: 'What lifestyle changes can help improve my liver enzyme levels?', tag: 'Liver'       },
];

const tagColours: Record<string, string> = {
  'Lipid Panel': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  'Diabetes':    'bg-amber-100  dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'Cholesterol': 'bg-red-100    dark:bg-red-900/40 text-red-700 dark:text-red-300',
  'CBC':         'bg-blue-100   dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Thyroid':     'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  'Liver':       'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

interface Props { onSelect: (prompt: string) => void; }

export default function SuggestedPrompts({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-10 text-center space-y-8">
      {/* Hero */}
      <div className="space-y-3 max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 dark:shadow-indigo-950">
          <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Ask me anything</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Upload a report for context using the paperclip, or just type a question.
          I explain medical terms in plain English and highlight what needs attention.
        </p>
      </div>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
        {SUGGESTIONS.map(({ q, tag }) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="group text-left text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
                       hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-50 dark:hover:shadow-indigo-950/30
                       transition-all duration-200 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-700 dark:text-slate-300 leading-snug group-hover:text-slate-900 dark:group-hover:text-white">{q}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-primary shrink-0 mt-0.5 transition-colors" aria-hidden="true" />
            </div>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${tagColours[tag] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
