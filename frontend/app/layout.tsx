import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: 'Qrivo - Dynamic QR Codes. Unlimited Scans.',
    template: '%s · Qrivo',
  },
  description:
    'Qrivo is a free, web-based platform to create dynamic QR codes, track scans, and view analytics. Change destinations anytime without reprinting. No app required to scan.',
  keywords: ['QR code', 'dynamic QR', 'QR analytics', 'free QR generator', 'scan tracking'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Qrivo - Dynamic QR Codes. Unlimited Scans.',
    description:
      'Create dynamic QR codes, track scans, and view analytics - free and entirely on the web.',
    url: config.siteUrl,
    siteName: 'Qrivo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qrivo - Dynamic QR Codes. Unlimited Scans.',
    description: 'Create dynamic QR codes, track scans, and view analytics - free on the web.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
