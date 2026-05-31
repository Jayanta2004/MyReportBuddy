"use client"

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" aria-hidden="true" />;

  const isDark = theme === 'dark';

  const handleToggle = () => {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    setTheme(isDark ? 'light' : 'dark');
    window.setTimeout(() => root.classList.remove('theme-transitioning'), 500);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        h-9 w-9 flex items-center justify-center rounded-lg
        text-slate-500 hover:text-slate-900 hover:bg-slate-100
        dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800
        transition-colors duration-150
      "
    >
      <span key={String(isDark)} className="animate-theme-icon">
        {isDark
          ? <Sun  className="h-4 w-4" aria-hidden="true" />
          : <Moon className="h-4 w-4" aria-hidden="true" />
        }
      </span>
    </button>
  );
}
