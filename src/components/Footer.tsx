import Link from 'next/link';
import { Activity, Heart, Github, Shield, Zap } from 'lucide-react';

const GITHUB_URL = 'https://github.com/Jayanta2004';

const productLinks = [
  { href: '/upload',  label: 'Analyze Report' },
  { href: '/chat',    label: 'AI Chat'         },
  { href: '/history', label: 'History'         },
  { href: '/about',   label: 'About'           },
];

const legalLinks = [
  { href: '/privacy',          label: 'Privacy Policy'    },
  { href: '/about#disclaimer', label: 'Medical Disclaimer' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400">
      {/* Subtle top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-8 pt-10 pb-6">

        {/* ── Upper section ─────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row justify-between gap-10">

          {/* Brand column */}
          <div className="max-w-xs space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="MyReportBuddy home"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-950 group-hover:scale-105 transition-transform duration-150">
                <Activity className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                MyReport<span className="text-indigo-400">Buddy</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Upload any medical report and get clear, plain-language insights powered by GPT-4o — in seconds.
            </p>

            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                Your files are never stored permanently
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                Powered by OpenAI GPT-4o
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 sm:gap-16 flex-wrap">

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
                Product
              </p>
              <ul className="space-y-3">
                {productLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
                Legal
              </p>
              <ul className="space-y-3">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="mt-8 pt-5 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">

          <span>&copy; {new Date().getFullYear()} MyReportBuddy. All rights reserved.</span>

          <span className="flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" aria-hidden="true" /> for better health literacy
          </span>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors duration-150 group"
            aria-label="GitHub profile — Jayanta2004"
          >
            <Github className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-150" aria-hidden="true" />
            <span>Jayanta2004</span>
          </a>

        </div>
      </div>
    </footer>
  );
}
