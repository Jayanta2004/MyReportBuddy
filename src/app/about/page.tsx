import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import Link from 'next/link';
import {
  Activity, ShieldCheck, TriangleAlert, Brain, Cpu, Eye,
  FileSearch, Droplets, HeartPulse, Gauge, FlaskConical,
  Microscope, TestTube2, PhoneCall, CheckCircle, ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About — MyReportBuddy',
  description: 'Learn how MyReportBuddy works, what reports it supports, and our commitment to your privacy.',
};

const pipeline = [
  {
    icon: FileSearch,
    label: 'Secure Upload',
    desc: 'You upload your medical report as a PDF or image file (PNG, JPG). Files are transmitted over an encrypted HTTPS connection and are never written to permanent storage.',
  },
  {
    icon: Cpu,
    label: 'Text Extraction',
    desc: 'For digitally generated PDFs, the document text is extracted directly using pdf-parse — a fast, lossless method that preserves numerical values and reference ranges with full fidelity.',
  },
  {
    icon: Eye,
    label: 'Vision Processing',
    desc: 'For scanned documents or image-based files, the report is processed by GPT-4o Vision at high resolution, enabling accurate recognition of printed and handwritten clinical data.',
  },
  {
    icon: Brain,
    label: 'AI Analysis',
    desc: 'The extracted content is submitted to GPT-4o with a domain-specific system prompt designed to produce a structured JSON output — covering report type, individual findings, interpretive insights, and recommended actions.',
  },
  {
    icon: Activity,
    label: 'Results Delivered',
    desc: 'The structured analysis is presented in plain language with contextual reference ranges, flagged abnormal values, and clear next-step guidance — formatted for non-clinical users.',
  },
];

const reportTypes = [
  {
    icon: Droplets,
    colour: 'icon-bg-red',
    iconColour: 'text-red-600 dark:text-red-400',
    label: 'Complete Blood Count (CBC)',
    desc: 'Haemoglobin, RBC, WBC, platelets, haematocrit, and differential counts.',
  },
  {
    icon: HeartPulse,
    colour: 'icon-bg-orange',
    iconColour: 'text-orange-600 dark:text-orange-400',
    label: 'Lipid Panel',
    desc: 'Total cholesterol, LDL, HDL, VLDL, triglycerides, and cardiovascular risk markers.',
  },
  {
    icon: Gauge,
    colour: 'icon-bg-violet',
    iconColour: 'text-violet-600 dark:text-violet-400',
    label: 'Thyroid Function Tests',
    desc: 'TSH, Free T3, Free T4, and thyroid antibody markers.',
  },
  {
    icon: TestTube2,
    colour: 'icon-bg-amber',
    iconColour: 'text-amber-600 dark:text-amber-400',
    label: 'Diabetes & Metabolic Markers',
    desc: 'Fasting glucose, post-prandial glucose, HbA1c, and insulin resistance indices.',
  },
  {
    icon: FlaskConical,
    colour: 'icon-bg-emerald',
    iconColour: 'text-emerald-600 dark:text-emerald-400',
    label: 'Liver Function Tests (LFT)',
    desc: 'ALT, AST, ALP, GGT, bilirubin, albumin, and total protein.',
  },
  {
    icon: Microscope,
    colour: 'icon-bg-blue',
    iconColour: 'text-blue-600 dark:text-blue-400',
    label: 'General & Comprehensive Panels',
    desc: 'Kidney function, electrolytes, vitamin levels, hormone panels, urine analysis, and more.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">

        {/* ── Page hero ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="container px-4 py-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 rounded-xl icon-bg-indigo flex items-center justify-center shadow-sm">
                <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">About</p>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">MyReportBuddy</h1>
              </div>
            </div>

            {/* Mission statement */}
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              MyReportBuddy is an AI-assisted medical report analysis service that helps
              individuals interpret laboratory test results in accessible, plain-language
              terms. The Service is designed to bridge the information gap between clinical
              data and patient understanding — empowering users to engage in more informed
              conversations with their treating physicians.
            </p>

            {/* What it is / isn't callout */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 text-sm text-indigo-800 dark:text-indigo-300">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                <p><strong>What it is:</strong> An educational tool that translates clinical data into plain language and highlights values that may require attention.</p>
              </div>
              <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 text-sm text-orange-800 dark:text-orange-300">
                <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0 text-orange-500 dark:text-orange-400" aria-hidden="true" />
                <p><strong>What it is not:</strong> A medical device, a diagnostic tool, or a substitute for professional medical advice from a qualified healthcare practitioner.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 py-14 max-w-3xl mx-auto space-y-14">

          {/* ── How It Works ──────────────────────────────── */}
          <AnimatedSection>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
              How the Analysis Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Each report submitted to MyReportBuddy passes through a multi-stage
              processing pipeline designed to maximise accuracy across diverse document
              formats and layouts.
            </p>

            <div className="relative">
              {/* Vertical connector */}
              <div
                className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-indigo-200 via-violet-200 to-indigo-200 dark:from-indigo-800 dark:via-violet-800 dark:to-indigo-800"
                aria-hidden="true"
              />
              <ol className="space-y-6" aria-label="Analysis pipeline steps">
                {pipeline.map(({ icon: Icon, label, desc }, i) => (
                  <li key={label} className="flex gap-4 items-start relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
                      <Icon className="h-[18px] w-[18px] text-white" aria-hidden="true" />
                    </div>
                    <div className="pt-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        <span className="text-slate-400 dark:text-slate-600 font-mono mr-1.5 text-xs">{String(i + 1).padStart(2, '0')}</span>
                        {label}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tech note */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider mb-3">Technical Notes</p>
              <p>
                <strong>Dual-path processing:</strong> The pipeline automatically selects
                between direct text extraction and GPT-4o Vision based on the document
                type — ensuring consistent output quality regardless of whether the
                source is a digital or scanned file.
              </p>
              <p>
                <strong>Structured output:</strong> GPT-4o is instructed to return a
                typed JSON schema covering report classification, per-marker findings
                (value, unit, reference range, status), summary insights, and
                recommended actions — eliminating free-form ambiguity in the response.
              </p>
              <p>
                <strong>No persistent file storage:</strong> Original report files are
                held in-memory only for the duration of the processing pipeline. They
                are not written to disk and are not retained after the API response
                is returned.
              </p>
            </div>
          </AnimatedSection>

          {/* ── Supported Report Types ─────────────────────── */}
          <AnimatedSection>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" aria-hidden="true" />
              Supported Report Types
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              MyReportBuddy is optimised for the laboratory investigation formats most
              commonly issued by diagnostic centres and hospitals in India. The following
              categories are explicitly supported; the Service may also provide partial
              analysis for other report types.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {reportTypes.map(({ icon: Icon, colour, iconColour, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`h-9 w-9 rounded-lg ${colour} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-[18px] w-[18px] ${iconColour}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Medical Disclaimer ─────────────────────────── */}
          <AnimatedSection>
            <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 dark:from-orange-950/30 to-amber-50 dark:to-amber-950/20 p-6">
              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-orange-800 dark:text-orange-300">
                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                Medical Information Disclaimer
              </h2>
              <div className="space-y-3 text-sm text-orange-900/85 dark:text-orange-200/80 leading-relaxed">
                <p>
                  <strong>Not a medical device:</strong> MyReportBuddy has not been
                  registered or approved by the Central Drugs Standard Control Organisation
                  (CDSCO) under the Medical Devices Rules, 2017. It does not constitute a
                  medical device under applicable Indian law and does not provide medical
                  advice, clinical diagnosis, prognosis, or treatment recommendations.
                </p>
                <p>
                  <strong>Informational purpose only:</strong> All AI-generated analysis
                  is provided for general informational and educational purposes. Outputs
                  may be incomplete, inaccurate, or inapplicable to your specific medical
                  circumstances, history, medications, or comorbidities.
                </p>
                <p>
                  <strong>Consult a qualified practitioner:</strong> You must consult a
                  medical practitioner registered under the National Medical Commission
                  Act, 2019, or an appropriate specialist before making any decision
                  regarding your health, diagnosis, or treatment. Do not disregard or
                  delay seeking professional medical advice on the basis of anything
                  generated by this Service.
                </p>
                <p>
                  <strong>Limitation of liability:</strong> MyReportBuddy and its
                  operators expressly disclaim all liability for any loss, harm, or injury
                  arising from reliance on AI-generated analysis. Use of this Service
                  constitutes your acknowledgement that such reliance is entirely at your
                  own risk.
                </p>
                <p className="flex items-start gap-2 font-semibold">
                  <PhoneCall className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Medical emergency: Do not use this Service. Call the National
                    Emergency Number <strong>112</strong> or your nearest emergency
                    services immediately.
                  </span>
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Privacy & Data Handling ────────────────────── */}
          <AnimatedSection>
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-teal-50 dark:to-teal-950/20 p-6">
              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                Privacy &amp; Data Handling
              </h2>
              <div className="space-y-3 text-sm text-emerald-900/80 dark:text-emerald-200/70 leading-relaxed">
                <p>
                  <strong>No persistent file storage:</strong> Uploaded files are held
                  temporarily in server memory solely for the duration of processing.
                  They are deleted immediately upon completion of the analysis pipeline
                  and are never indexed, retained, or written to permanent storage.
                </p>
                <p>
                  <strong>Third-party processing:</strong> File content is transmitted
                  to OpenAI, Inc. (United States) via their API for AI analysis; to
                  Supabase, Inc. (United States) for optional history storage; and served
                  via Vercel, Inc. (United States) infrastructure. All three are entities
                  based outside India — cross-border data transfer applies.
                </p>
                <p>
                  <strong>Indian law compliance:</strong> Data handling is governed by
                  the Digital Personal Data Protection Act, 2023 (&quot;DPDPA&quot;) and the
                  Information Technology (Reasonable Security Practices and Procedures
                  and Sensitive Personal Data or Information) Rules, 2011. Health reports
                  constitute Sensitive Personal Data or Information (SPDI) under Rule 3
                  of the SPDI Rules.
                </p>
                <p>
                  <strong>Your rights:</strong> As a Data Principal under the DPDPA, you
                  have rights to information, correction, erasure, grievance redressal,
                  and nomination. Stored analysis results may be deleted at any time from
                  the Report History page.
                </p>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-200 transition-colors"
                >
                  Read our full Privacy Policy
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </main>

      <Footer />
    </div>
  );
}
