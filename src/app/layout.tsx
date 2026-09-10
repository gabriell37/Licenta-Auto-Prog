import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AutoProg — Programări service auto online',
    template: '%s · AutoProg',
  },
  description:
    'Găsește service auto de încredere și fă-ți programare online în câteva secunde. Anvelope, ITP, diagnoză, mecanică și mai mult — fără telefoane.',
  applicationName: 'AutoProg',
  keywords: ['service auto', 'programare online', 'vulcanizare', 'ITP', 'anvelope', 'mecanic', 'România'],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafb' },
    { media: '(prefers-color-scheme: dark)', color: '#080b12' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Skip link for keyboard users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-fg-on-brand"
        >
          Sari la conținut
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
