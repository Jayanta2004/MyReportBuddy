import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Upload } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-6 max-w-md">

          {/* Icon */}
          <div className="relative mx-auto w-fit">
            <div className="h-24 w-24 rounded-3xl icon-bg-indigo flex items-center justify-center mx-auto shadow-lg shadow-indigo-200/60 dark:shadow-indigo-950/60">
              <FileQuestion className="h-12 w-12 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            {/* Floating badge */}
            <span
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-black text-slate-500 dark:text-slate-400 shadow-sm"
              aria-hidden="true"
            >
              ?
            </span>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <p className="text-7xl font-black gradient-text" aria-hidden="true">404</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Page not found</h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-xs mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="rounded-xl">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Analyse a Report
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
