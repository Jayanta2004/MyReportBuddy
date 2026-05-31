import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/chat/ChatInterface';
import { Bot, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Health Assistant — MyReportBuddy',
  description:
    'Ask questions about your medical reports or any health topic. Plain-language AI answers powered by GPT-4o.',
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* ── Branded chat header ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="px-4 py-3 max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">

          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-indigo-900/60 shrink-0">
              <Bot className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  AI Health Assistant
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  GPT-4o
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                Plain-language answers to your health questions
              </p>
            </div>
          </div>

          {/* Disclaimer — right-aligned on larger screens */}
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-full px-3 py-1.5 font-medium shrink-0">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Informational only — not a substitute for medical advice
          </div>
        </div>
      </div>

      {/* Chat shell — fills remaining height */}
      <div className="flex-1 overflow-hidden relative">
        <ChatInterface />
      </div>
    </div>
  );
}
