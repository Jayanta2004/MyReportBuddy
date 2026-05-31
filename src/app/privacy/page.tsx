import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Shield, Eye, Database, Lock, Users, HeartPulse,
  RefreshCw, Mail, CheckCircle, Cookie, Scale, Baby,
  Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — MyReportBuddy',
  description: 'How MyReportBuddy collects, uses, and protects your personal and health data under Indian law.',
};

const EFFECTIVE_DATE = 'May 30, 2026';
const LAST_UPDATED   = 'May 30, 2026';

const sections = [
  {
    num: '01',
    icon: Eye,
    title: 'Information We Collect',
    colour: 'icon-bg-indigo',
    iconColour: 'text-indigo-600 dark:text-indigo-400',
    content: (
      <>
        <p>
          MyReportBuddy is designed with data minimisation as a core principle, consistent
          with the obligations of a Data Fiduciary under the Digital Personal Data
          Protection Act, 2023 (&quot;DPDPA&quot;). We collect only the information that is
          strictly necessary to provide the analysis service you request.
        </p>

        <h3 className="mt-4 mb-2 font-semibold text-slate-800 dark:text-slate-200">Information you provide directly</h3>
        <ul className="space-y-1.5">
          {[
            'Medical report files uploaded by you for analysis (PDF, PNG, JPG, or similar formats)',
            'Optional contextual notes you enter alongside an upload',
            'Chat messages submitted via the assistant interface',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-4 mb-2 font-semibold text-slate-800 dark:text-slate-200">Information stored if report history is enabled</h3>
        <ul className="space-y-1.5">
          {[
            'The filename, file type, and file size of your uploaded report',
            'The structured AI-generated analysis result',
            'Upload and processing timestamps',
            'Report type classification (e.g. Blood Test, Lipid Panel)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4">
          We do <strong>not</strong> collect your name, email address, Aadhaar number,
          PAN, mobile number, postal address, payment information, or any other personally
          identifiable information unless you explicitly provide it to us. The original
          binary content of uploaded files is <strong>not</strong> permanently stored on
          our servers.
        </p>
      </>
    ),
  },
  {
    num: '02',
    icon: Database,
    title: 'How We Use Your Information',
    colour: 'icon-bg-violet',
    iconColour: 'text-violet-600 dark:text-violet-400',
    content: (
      <>
        <p>
          We process your personal data exclusively for the specified, explicit purposes
          described below, in accordance with the purpose limitation principle under the
          DPDPA, 2023. Our legal basis for processing is your <strong>free, specific,
          informed, unconditional, and unambiguous consent</strong> as required under
          Section 6 of the DPDPA, 2023.
        </p>
        <ul className="mt-3 space-y-2">
          {[
            { title: 'Service delivery', desc: 'To transmit your uploaded file to our AI processor and return an analysis result to you.' },
            { title: 'History & continuity', desc: 'To store analysis results in the optional history database so you may review them at a later date.' },
            { title: 'Service improvement', desc: 'To monitor aggregate, anonymised usage patterns and maintain service reliability. We do not link usage data to individual Data Principals.' },
            { title: 'Legal compliance', desc: 'To comply with applicable Indian laws, regulations, court orders, or enforceable directions from competent authorities.' },
          ].map(({ title, desc }) => (
            <li key={title} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>{title}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          File content is transmitted to the OpenAI API for AI-powered analysis. By
          uploading a file, you acknowledge that its content will be processed by OpenAI
          — an entity based outside India — subject to their{' '}
          <a
            href="https://openai.com/policies/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://openai.com/policies/usage-policies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Usage Policies
          </a>.
          Please refer to Section 06 for our cross-border data transfer disclosures.
        </p>
      </>
    ),
  },
  {
    num: '03',
    icon: RefreshCw,
    title: 'Data Retention',
    colour: 'icon-bg-emerald',
    iconColour: 'text-emerald-600 dark:text-emerald-400',
    content: (
      <>
        <p>
          In compliance with the storage limitation principle under the DPDPA, 2023, we
          retain personal data only for as long as necessary to fulfil the purpose for
          which it was collected, or as required by applicable law. Once the purpose is
          served and no legal retention obligation applies, the data is deleted.
        </p>
        <ul className="mt-3 space-y-2">
          {[
            { title: 'Uploaded files', desc: 'Deleted from our servers immediately upon completion of processing. Files are never persisted to permanent storage.' },
            { title: 'Analysis results', desc: 'Retained in the history database until you delete them via the Report History page, or until the service is discontinued.' },
            { title: 'Chat messages', desc: 'Held in your browser session memory only. They are not transmitted to or stored on our servers beyond the duration of the API call.' },
            { title: 'Service logs', desc: 'Server-side operational logs may be retained for up to 30 days for debugging and security monitoring, after which they are purged.' },
          ].map(({ title, desc }) => (
            <li key={title} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>{title}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: '04',
    icon: Lock,
    title: 'Data Security',
    colour: 'icon-bg-blue',
    iconColour: 'text-blue-600 dark:text-blue-400',
    content: (
      <>
        <p>
          We implement reasonable security practices and procedures as mandated under
          the <strong>Information Technology (Reasonable Security Practices and Procedures
          and Sensitive Personal Data or Information) Rules, 2011</strong> (&quot;SPDI Rules&quot;)
          framed under the Information Technology Act, 2000, and the security obligations
          prescribed under Section 8(5) of the DPDPA, 2023. Our measures include, but
          are not limited to:
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'Transport Layer Security (TLS/HTTPS) encryption for all data in transit',
            'File type and size validation to prevent malformed or malicious uploads',
            'Input sanitisation and output encoding to mitigate injection risks',
            'Server-side environment variables for all API keys and credentials — no secrets are exposed to the client',
            'Row-level access controls on the database to prevent cross-user data access',
            'Periodic review of security controls in line with reasonable security practices',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          In the event of a personal data breach that is likely to affect you, we will
          notify the Data Protection Board of India and, where required, affected Data
          Principals, in the manner prescribed under the DPDPA, 2023.
        </p>
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-xs italic">
          No method of electronic transmission or storage is completely secure. While we
          apply commercially reasonable safeguards, we cannot guarantee absolute security
          of data transmitted over the internet.
        </p>
      </>
    ),
  },
  {
    num: '05',
    icon: Users,
    title: 'Third-Party Data Processors',
    colour: 'icon-bg-amber',
    iconColour: 'text-amber-600 dark:text-amber-400',
    content: (
      <>
        <p>
          We engage the following third-party Data Processors to deliver our service. We
          do not sell, rent, or trade your personal data to any third party for marketing
          or commercial purposes, in compliance with Section 8(3) of the DPDPA, 2023.
        </p>
        <div className="mt-4 space-y-3">
          {[
            {
              name: 'OpenAI, Inc.',
              location: 'United States',
              purpose: 'AI language model inference — processes uploaded file content to generate the medical report analysis.',
              link: 'https://openai.com/policies/privacy-policy',
              linkLabel: 'OpenAI Privacy Policy',
            },
            {
              name: 'Supabase, Inc.',
              location: 'United States',
              purpose: 'Optional PostgreSQL database hosting — stores analysis results and report metadata if the history feature is enabled.',
              link: 'https://supabase.com/privacy',
              linkLabel: 'Supabase Privacy Policy',
            },
            {
              name: 'Vercel, Inc.',
              location: 'United States',
              purpose: 'Application hosting and edge infrastructure — serves the web application and Next.js API routes.',
              link: 'https://vercel.com/legal/privacy-policy',
              linkLabel: 'Vercel Privacy Policy',
            },
          ].map(({ name, location, purpose, link, linkLabel }) => (
            <div key={name} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{name}</p>
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                  {location}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{purpose}</p>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors mt-1 inline-block"
              >
                {linkLabel} ↗
              </a>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: '06',
    icon: Globe,
    title: 'Cross-Border Data Transfers',
    colour: 'icon-bg-cyan',
    iconColour: 'text-cyan-600 dark:text-cyan-400',
    content: (
      <>
        <p>
          All three of our Data Processors — OpenAI, Supabase, and Vercel — are
          headquartered in the United States. Accordingly, your personal data, including
          any health-related information contained in uploaded reports, is transferred
          outside the territory of India for processing.
        </p>
        <p className="mt-3">
          Under Section 16 of the DPDPA, 2023, the Central Government may, by
          notification, restrict the transfer of personal data to certain countries or
          territories. At the time this policy was last updated, no such restrictive
          notification had been issued in respect of the United States. We will update
          this section promptly if any relevant restriction is notified.
        </p>
        <p className="mt-3">
          By providing your consent and using the Service, you acknowledge and agree to
          the transfer of your personal data to processors located outside India, subject
          to the protections described in this Privacy Policy and the contractual and
          legal obligations binding each processor.
        </p>
        <p className="mt-3">
          We require all Data Processors to implement appropriate security safeguards
          for any personal data they receive from us, and we do not authorise processors
          to use your personal data for any purpose beyond delivering the contracted
          service.
        </p>
      </>
    ),
  },
  {
    num: '07',
    icon: HeartPulse,
    title: 'Sensitive Personal Data & Health Information',
    colour: 'icon-bg-rose',
    iconColour: 'text-rose-600 dark:text-rose-400',
    content: (
      <>
        <p>
          Health and medical records are classified as <strong>Sensitive Personal Data
          or Information (&quot;SPDI&quot;)</strong> under Rule 3 of the Information Technology
          (Reasonable Security Practices and Procedures and Sensitive Personal Data or
          Information) Rules, 2011. Under the DPDPA, 2023, health data constitutes
          personal data that warrants a heightened standard of care in processing.
        </p>
        <p className="mt-3">
          By uploading a medical report to this Service, you provide your <strong>explicit,
          informed, and unambiguous consent</strong> to the processing of that Sensitive
          Personal Data for the sole purpose of generating an AI-assisted analysis. You
          may withdraw this consent at any time (see Section 09 — Your Rights).
        </p>
        <p className="mt-3">
          We strongly encourage you to consider the following before uploading:
        </p>
        <ul className="mt-2 space-y-1.5">
          {[
            'Redact any information not relevant to your query (e.g. full name, Aadhaar number, address, mobile number)',
            'Do not upload documents belonging to third parties without their prior express written consent',
            'Review OpenAI\'s data usage policy to understand how your data may interact with their model training practices',
            'The AI-generated analysis is for informational purposes only and does not constitute medical advice — always consult a registered medical practitioner',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: '08',
    icon: Cookie,
    title: 'Cookies & Local Storage',
    colour: 'icon-bg-indigo',
    iconColour: 'text-indigo-600 dark:text-indigo-400',
    content: (
      <>
        <p>
          MyReportBuddy uses a minimal number of browser storage mechanisms, all strictly
          necessary for the operation of the service. We do not use advertising cookies,
          tracking pixels, or cross-site behavioural analytics.
        </p>
        <div className="mt-4 space-y-3">
          {[
            {
              name: 'Theme preference',
              type: 'localStorage',
              purpose: 'Stores your selected light or dark mode preference across sessions.',
              duration: 'Persistent (until cleared by you)',
            },
            {
              name: 'Disclaimer acknowledgement',
              type: 'localStorage',
              purpose: 'Records that you have read and acknowledged the medical disclaimer, preventing repeated display.',
              duration: 'Persistent (until cleared by you)',
            },
          ].map(({ name, type, purpose, duration }) => (
            <div key={name} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{name}</p>
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{type}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{purpose}</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Duration: {duration}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          You may clear all locally stored data at any time via your browser&apos;s developer
          tools or privacy settings. Doing so will reset your theme and disclaimer
          preferences but will not affect any data stored in the server-side database.
        </p>
      </>
    ),
  },
  {
    num: '09',
    icon: Scale,
    title: 'Your Rights as a Data Principal',
    colour: 'icon-bg-violet',
    iconColour: 'text-violet-600 dark:text-violet-400',
    content: (
      <>
        <p>
          Under the <strong>Digital Personal Data Protection Act, 2023</strong>, you are
          a <em>Data Principal</em> and have the following statutory rights with respect
          to your personal data processed by us as Data Fiduciary. We are committed to
          honouring these rights within the timelines prescribed by law.
        </p>
        <ul className="mt-3 space-y-3">
          {[
            {
              right: 'Right to Information (Section 11)',
              desc: 'Obtain a summary of the personal data being processed by us and the identities of all Data Fiduciaries and Data Processors with whom your data has been shared.',
            },
            {
              right: 'Right to Correction, Completion & Erasure (Section 12)',
              desc: 'Request correction of inaccurate or incomplete personal data, and erasure of personal data that is no longer necessary for the purpose for which it was collected. Stored analysis results may be deleted directly from the Report History page.',
            },
            {
              right: 'Right to Grievance Redressal (Section 13)',
              desc: 'Raise a grievance with our Grievance Officer (see Section 11). If dissatisfied with our response, you may escalate the matter to the Data Protection Board of India.',
            },
            {
              right: 'Right to Nominate (Section 14)',
              desc: 'Nominate another individual to exercise your rights under the DPDPA in the event of your death or incapacity.',
            },
            {
              right: 'Right to Withdraw Consent (Section 6(4))',
              desc: 'Withdraw your consent for the processing of your personal data at any time. Withdrawal does not affect the lawfulness of processing carried out prior to withdrawal. Discontinue use of the Service to exercise this right prospectively.',
            },
          ].map(({ right, desc }) => (
            <li key={right} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>{right}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          To exercise any of the above rights, please contact our Grievance Officer using
          the details in Section 11. We will acknowledge your request within
          <strong> 48 hours</strong> and endeavour to resolve it within <strong>30 days</strong>.
        </p>
      </>
    ),
  },
  {
    num: '10',
    icon: Baby,
    title: "Children's Privacy",
    colour: 'icon-bg-emerald',
    iconColour: 'text-emerald-600 dark:text-emerald-400',
    content: (
      <>
        <p>
          In accordance with <strong>Section 9 of the DPDPA, 2023</strong>, we do not
          knowingly process the personal data of children (individuals under the age of
          <strong> 18 years</strong>) without obtaining verifiable consent from their
          parent or lawful guardian prior to processing.
        </p>
        <p className="mt-3">
          MyReportBuddy is intended for use by adults. If you are under 18 years of age,
          please do not use this Service without the involvement and consent of your
          parent or lawful guardian.
        </p>
        <p className="mt-3">
          If we become aware that we have inadvertently collected personal data from a
          child without the requisite parental or guardian consent, we will promptly delete
          that data and, where applicable, notify the Data Protection Board of India.
          If you have reason to believe that a child has used this Service without
          appropriate consent, please contact us immediately using the details in Section 11.
        </p>
      </>
    ),
  },
  {
    num: '11',
    icon: RefreshCw,
    title: 'Changes to This Policy',
    colour: 'icon-bg-amber',
    iconColour: 'text-amber-600 dark:text-amber-400',
    content: (
      <>
        <p>
          We reserve the right to update this Privacy Policy at any time to reflect
          changes in our data processing practices, the features of the Service, or
          amendments to applicable Indian law (including subordinate legislation and
          rules issued under the DPDPA, 2023). When we make material changes, we will
          revise the <em>Last Updated</em> date at the top of this page.
        </p>
        <p className="mt-3">
          Where any change materially affects your rights or the way in which we process
          your Sensitive Personal Data, we will take reasonable steps to bring the change
          to your attention prior to it taking effect.
        </p>
        <p className="mt-3">
          Continued use of MyReportBuddy following the posting of changes constitutes
          your acceptance of the revised Privacy Policy. If you do not agree to an
          updated policy, please discontinue use of the Service.
        </p>
      </>
    ),
  },

];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container px-4 py-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl icon-bg-indigo flex items-center justify-center shrink-0">
              <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Legal</p>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Effective: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>

          {/* Intro */}
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            MyReportBuddy (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy
            of every individual (&quot;Data Principal&quot;) who uses our AI-powered medical report
            analysis service (the &quot;Service&quot;). This Privacy Policy is published in
            accordance with the <strong>Digital Personal Data Protection Act, 2023</strong>{' '}
            (&quot;DPDPA&quot;), the <strong>Information Technology Act, 2000</strong>, and the
            rules framed thereunder, including the IT (Reasonable Security Practices and
            Procedures and Sensitive Personal Data or Information) Rules, 2011. Please
            read this policy carefully before using the Service.
          </p>

          {/* Privacy at a Glance */}
          <div className="mt-5 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-4 text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <div>
              <p className="font-semibold mb-1">Privacy at a Glance</p>
              <p className="leading-relaxed">
                We do not permanently store your files. We do not sell your data. We do not
                require an account or collect personal identifiers such as your name,
                Aadhaar, or mobile number. Your uploads are processed solely to generate
                the analysis you requested, with your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <main className="flex-1 py-10 px-4">
        <div className="container max-w-3xl mx-auto space-y-4">
          {sections.map(({ num, icon: Icon, title, colour, iconColour, content }) => (
            <div
              key={num}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200"
            >
              {/* Section head */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
                <div className={`h-9 w-9 rounded-lg ${colour} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-[18px] w-[18px] ${iconColour}`} aria-hidden="true" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">{title}</h2>
                <span className="ml-auto text-xs font-mono font-semibold text-slate-300 dark:text-slate-600">{num}</span>
              </div>

              {/* Section body */}
              <div className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {content}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 pt-4 pb-2">
            This Privacy Policy was last reviewed on {LAST_UPDATED} and is effective as of {EFFECTIVE_DATE}.
            Governed by the laws of India. Disputes subject to jurisdiction of courts in India.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
