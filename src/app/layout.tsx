import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import DisclaimerModal from '@/components/DisclaimerModal';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyReportBuddy - AI-Powered Medical Report Analysis',
  description:
    'Upload your medical reports and get clear, plain-language insights powered by AI. Understand your health data better.',
  keywords: ['medical report', 'health analysis', 'AI health', 'blood test analysis', 'lab report'],
  authors: [{ name: 'MyReportBuddy' }],
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg',    type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <DisclaimerModal />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
