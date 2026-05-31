"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, X, MessageCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { href: '/',        label: 'Home'    },
  { href: '/upload',  label: 'Analyze' },
  { href: '/chat',    label: 'Chat',    icon: MessageCircle, badge: 'AI' },
  { href: '/history', label: 'History' },
  { href: '/about',   label: 'About'   },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/92 dark:bg-slate-900/92 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm shadow-slate-100 dark:shadow-slate-900'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-transparent'
      )}
    >
      <div className="w-full flex h-16 items-center justify-between px-6">

        {/* ── Brand ─────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl group shrink-0"
          aria-label="MyReportBuddy home"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-indigo-900 group-hover:scale-105 transition-transform">
            <Activity className="h-[18px] w-[18px] text-white" aria-hidden="true" />
          </div>
          <span className="text-slate-900 dark:text-white tracking-tight">
            MyReport<span className="text-primary">Buddy</span>
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {navLinks.map((link) => {
            const Icon  = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'text-primary bg-primary/8 dark:bg-primary/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                {link.label}
                {link.badge && (
                  <span className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 leading-none">
                    {link.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* CTA */}
          <Link
            href="/upload"
            className="flex items-center gap-1.5 ml-1 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-gradient"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Analyze Free
          </Link>
        </nav>

        {/* ── Mobile: theme toggle + hamburger ──────────────── */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? <X    className="h-5 w-5" aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pb-4 pt-2 flex flex-col gap-1 animate-slide-down"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => {
            const Icon  = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'text-primary bg-primary/8 dark:bg-primary/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {link.label}
                {link.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 leading-none ml-0.5">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/upload"
            className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Analyze Free
          </Link>
        </nav>
      )}
    </header>
  );
}
