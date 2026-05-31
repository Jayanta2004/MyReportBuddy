import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import {
  Upload, Brain, FileText, ShieldCheck, Zap, BarChart2,
  ArrowRight, CheckCircle, MessageCircle, Sparkles,
  TrendingUp, Clock, Lock, ChevronRight,
} from 'lucide-react';

/* ── Feature cards ─────────────────────────────────────────── */
const features = [
  {
    icon: Upload,       iconBg: 'icon-bg-indigo',  iconColor: 'text-indigo-600',
    title: 'Multi-File Upload',
    desc: 'Drag & drop up to 5 PDFs or images at once. CBC + Lipid Panel? Analyze together.',
  },
  {
    icon: MessageCircle, iconBg: 'icon-bg-violet', iconColor: 'text-violet-600',
    title: 'AI Health Chat',
    desc: 'Ask follow-up questions about your results in plain English — any time.',
  },
  {
    icon: Brain,         iconBg: 'icon-bg-blue',   iconColor: 'text-blue-600',
    title: 'GPT-4o Vision',
    desc: 'Reads printed tables, handwritten notes, and scanned pages with high accuracy.',
  },
  {
    icon: BarChart2,     iconBg: 'icon-bg-emerald', iconColor: 'text-emerald-600',
    title: 'Color-Coded Findings',
    desc: 'Every parameter flagged: Normal · High · Low · Critical — at a glance.',
  },
  {
    icon: Zap,           iconBg: 'icon-bg-amber',  iconColor: 'text-amber-600',
    title: 'Actionable Insights',
    desc: 'Personalised diet, lifestyle, and follow-up recommendations per your values.',
  },
  {
    icon: ShieldCheck,   iconBg: 'icon-bg-cyan',   iconColor: 'text-cyan-600',
    title: 'Privacy First',
    desc: 'Files deleted after processing. Never stored, never sold, never shared.',
  },
];

/* ── Process steps ─────────────────────────────────────────── */
const steps = [
  {
    n: '01', icon: Upload,
    title: 'Upload Your Report',
    desc: 'Drag and drop a PDF or image — or describe your symptoms in the chat box.',
  },
  {
    n: '02', icon: Brain,
    title: 'AI Reads Everything',
    desc: 'GPT-4o Vision extracts every value, table, and note in under 20 seconds.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Understand Your Results',
    desc: 'Review plain-language findings with colour codes, insights, and actions.',
  },
];

/* ── Supported report types ───────────────────────────────── */
const reportTypes = [
  'Complete Blood Count', 'Lipid Panel', 'HbA1c / Diabetes',
  'Thyroid (TSH / T3 / T4)', 'Liver Function (LFT)', 'Kidney Function (RFT)',
  'Vitamin D', 'Iron Studies', 'Urinalysis', 'COVID / Serology',
  'Hormone Panel', 'Electrolytes', 'Cardiac Markers', 'Vitamin B12',
];

/* ── Checklist items ──────────────────────────────────────── */
const deliverables = [
  'Report type detected automatically',
  'Plain-language 2-3 sentence summary',
  'Colour-coded Normal / High / Low / Critical status',
  'Per-parameter explanation in everyday English',
  'Insights personalised to your description',
  'Dietary & lifestyle recommendations',
  'Red-flag alerts for urgent values',
  'Downloadable PDF summary',
];

/* ── Stats ────────────────────────────────────────────────── */
const stats = [
  { value: '14+',  label: 'Report types supported', icon: FileText },
  { value: '~20s', label: 'Average analysis time',   icon: Clock    },
  { value: '100%', label: 'Files deleted after use', icon: Lock     },
];

/* ════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="gradient-hero text-white" aria-labelledby="hero-heading">
          {/* Decorative glow orbs */}
          <div className="glow-orb w-96 h-96 bg-indigo-500/30 -top-20 -left-20"      style={{animationDelay:'0s'}} />
          <div className="glow-orb w-72 h-72 bg-violet-500/20  top-1/2  right-0"     style={{animationDelay:'1.5s'}} />
          <div className="glow-orb w-48 h-48 bg-purple-400/15  bottom-0 left-1/3"    style={{animationDelay:'3s'}} />

          <div className="container relative z-10 text-center py-24 md:py-32 px-4 max-w-4xl mx-auto">
            {/* Badge pill */}
            <div className="animate-slide-up inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-white/90 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" aria-hidden="true" />
              Powered by GPT-4o Vision · Free to use · No sign-up
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="animate-slide-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6"
            >
              Understand Your{' '}
              <span className="gradient-text">Medical Reports</span>
              <br />in Plain English
            </h1>

            {/* Sub */}
            <p className="animate-slide-up delay-200 text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Upload your lab reports, blood tests, or health scans and get instant
              AI-powered insights — clear, accurate, and jargon-free.
            </p>

            {/* CTAs */}
            <div className="animate-slide-up delay-300 flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/92 font-semibold shadow-lg shadow-indigo-900/30 rounded-xl h-12 px-7">
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Analyze Your Report
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 bg-transparent rounded-xl h-12 px-7">
                <Link href="/chat">
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Chat with AI
                </Link>
              </Button>
            </div>

            {/* Report type pills */}
            <div className="animate-fade-in delay-500">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                Supports all common report types
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['CBC', 'Lipid Panel', 'HbA1c', 'TSH', 'LFT', 'RFT', 'Vitamin D', 'Urinalysis', 'Iron Studies', '+ more'].map((t) => (
                  <span key={t} className="glass text-white/75 text-xs px-3 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ───────────────────────────────────────── */}
        <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" aria-label="Key statistics">
          <div className="container px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 max-w-2xl mx-auto">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center justify-center gap-3 py-4 sm:py-2 px-6">
                  <div className="h-9 w-9 rounded-lg icon-bg-indigo flex items-center justify-center shrink-0">
                    <Icon className="h-[18px] w-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white dark:bg-slate-950" aria-labelledby="how-heading">
          <div className="container px-4">
            <AnimatedSection className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Simple process</p>
              <h2 id="how-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                From Report to Insights in 3 Steps
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-indigo-200 via-violet-300 to-indigo-200 dark:from-indigo-900 dark:via-violet-800 dark:to-indigo-900 z-0" aria-hidden="true" />

              {steps.map(({ n, icon: Icon, title, desc }, i) => (
                <AnimatedSection key={n} delayClass={`reveal-delay-${i + 1}`}>
                  <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-50 dark:hover:shadow-indigo-950 transition-all duration-300 group">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900 mb-4 group-hover:scale-105 transition-transform">
                      <span className="text-xs font-bold text-white/70 leading-none">{n}</span>
                      <Icon className="h-5 w-5 text-white mt-0.5" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900" aria-labelledby="features-heading">
          <div className="container px-4">
            <AnimatedSection className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Features</p>
              <h2 id="features-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                Everything You Need, Nothing You Don&apos;t
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">
                Hospital-quality report analysis without the wait, the jargon, or the bill.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {features.map(({ icon: Icon, iconBg, iconColor, title, desc }, i) => (
                <AnimatedSection key={title} delayClass={`reveal-delay-${(i % 3) + 1}`}>
                  <div className="card-lift group p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-default">
                    <div className={`h-11 w-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-5 w-5 ${iconColor} dark:brightness-125`} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── REPORT TYPES ───────────────────────────────────── */}
        <section className="py-16 bg-white dark:bg-slate-950 overflow-hidden" aria-labelledby="types-heading">
          <div className="container px-4">
            <AnimatedSection className="text-center mb-8">
              <h2 id="types-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Works With 14+ Report Types
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Upload any standard lab report and MyReportBuddy will figure out the rest.
              </p>
            </AnimatedSection>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {reportTypes.map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-default"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ───────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" aria-labelledby="get-heading">
          <div className="container px-4 max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Output</p>
              <h2 id="get-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                What&apos;s in Every Analysis
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {deliverables.map((item, i) => (
                <AnimatedSection key={item} delayClass={`reveal-delay-${(i % 4) + 1}`}>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="py-20 gradient-cta text-white" aria-labelledby="cta-heading">
          <div className="container px-4 text-center max-w-2xl mx-auto">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
                No sign-up required
              </div>
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                Ready to Understand Your Health?
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Upload your first report in seconds. Get results that actually make sense.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/92 font-semibold rounded-xl h-12 px-8 shadow-lg">
                  <Link href="/upload">
                    Analyze Your Report
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 bg-transparent rounded-xl h-12 px-8">
                  <Link href="/chat">
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Ask the AI
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
