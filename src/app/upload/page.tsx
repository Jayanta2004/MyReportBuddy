import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import { CheckCircle, FileText, Brain, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analyze Your Report — MyReportBuddy',
  description: 'Upload your medical report and get AI-powered plain-language insights.',
};

const perks = [
  { icon: FileText, text: 'PDF, JPG, PNG, WEBP supported' },
  { icon: Brain,    text: 'GPT-4o Vision reads every value' },
  { icon: Zap,      text: 'Results in ~20 seconds'          },
  { icon: CheckCircle, text: 'Files deleted after processing' },
];

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="container px-4 py-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-4">
              <Brain className="h-3.5 w-3.5" aria-hidden="true" />
              AI-Powered Analysis
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Analyze Your Medical Report(s)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Upload up to&nbsp;<strong className="text-slate-700 dark:text-slate-300">5 reports</strong> at once — PDFs or images.
              Optionally describe your symptoms for personalised insights. Results arrive in&nbsp;~20&nbsp;seconds.
            </p>

            {/* Perk pills */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-5">
              {perks.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Upload card */}
        <div className="container px-4 py-12 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-100/80 dark:shadow-slate-950 overflow-hidden">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" aria-hidden="true" />
            <div className="p-6 md:p-8">
              <FileUpload />
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Tips for the best results
            </p>
            <ul className="space-y-1.5 text-sm text-indigo-700/80 dark:text-indigo-400">
              {[
                'Upload multiple related reports together (e.g. CBC + Lipid Panel)',
                'Describing your symptoms helps the AI personalise insights',
                'PDFs with selectable text give the most accurate analysis',
                'Image files should be well-lit, flat, and fully in frame',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
