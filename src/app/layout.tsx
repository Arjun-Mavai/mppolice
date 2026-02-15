import type { Metadata, Viewport } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import PwaRegistry from '@/components/PwaRegistry';
import { Suspense } from 'react';
import Providers from './Providers';
import { AppFooter } from '@/components/layout/AppFooter';
import { GlobalLockModal } from '@/components/GlobalLockModal';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import dynamic from 'next/dynamic';
import { VersionManager } from '@/components/VersionManager';

const InstallPrompt = dynamic(() =>
  import('@/components/InstallPrompt').then((m) => m.InstallPrompt)
);
const SupportButton = dynamic(() =>
  import('@/components/SupportButton').then((m) => m.SupportButton)
);

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mppsc.zenscroll.app';
export const metadata: Metadata = {
  title: {
    default: 'Mindful MPPSC | Crack MPPSC 2026 with Mnemonics',
    template: '%s | Mindful MPPSC',
  },
  description:
    "🏆 MPPSC 2026 Best Test Series | Crack Prelims with 5+ Years PYQs, CSAT & Full Length Tests. India's First Bilingual App with Mnemonics for guaranteed selection. Start Free!",
  keywords: [
    'MPPSC 2026 Test Series',
    'MPPSC Prelims Mock Test',
    'MPPSC Previous Year Papers',
    'MPPSC Mnemonics',
    'MPPSC Notes Hindi',
    'MPPSC Syllabus 2026',
    'Best MPPSC App',
    'MP Govt Exams',
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    title: 'MPPSC 2026 Test Series | 4000+ Questions & Mnemonics',
    description:
      'Looking for MPPSC 2026 Test Series? Get 5+ Years PYQs, Topic-wise Tests, and Mnemonics in Hindi & English. The smartest way to clear MPPSC Prelims.',
    siteName: 'Mindful MPPSC',
    images: [
      {
        url: '/og-hero.webp', // Assuming we will place this image in public
        width: 1200,
        height: 630,
        alt: 'MPPSC 2026 Test Series Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mindful MPPSC | Best App for MPPSC 2026',
    description: "Master MPPSC with India's first Bilingual Mnemonic App.",
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mindful MPPSC',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data — helps Google show rich results
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mindful MPPSC',
    url: baseUrl,
    description:
      'The #1 App for MPPSC 2026 Preparation with Mnemonics, Bilingual Notes, Tests & Quizzes',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/blogs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Mindful MPPSC',
    url: baseUrl,
    description: "India's first bilingual mnemonic-based MPPSC preparation platform",
    sameAs: [],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${playfair.variable} bg-gray-50 font-sans text-gray-900 antialiased`}
      >
        <GlobalErrorBoundary>
          <PwaRegistry />
          <Providers>
            <div className="min-h-screen">{children}</div>

            <AppFooter />
            <GlobalLockModal />
            <ScrollToTop />
          </Providers>
          <Suspense fallback={null}>
            <SupportButton />
          </Suspense>
          <Toaster position="top-right" richColors />
          <InstallPrompt />
          <VersionManager />
        </GlobalErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
