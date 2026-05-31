import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/chat/ChatInterface';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Health Chat — MyReportBuddy',
  description: 'Ask questions about your medical reports or any health topic. Plain-language AI answers.',
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Disclaimer ribbon */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2 shrink-0">
        <p className="text-center text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          For informational purposes only — not a substitute for professional medical advice.
          Always consult your doctor.
        </p>
      </div>

      {/* Chat shell */}
      <div className="flex-1 overflow-hidden relative">
        <ChatInterface />
      </div>
    </div>
  );
}
