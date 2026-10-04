import type { Metadata, Viewport } from 'next';
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
import Script from 'next/script';

const InstallPrompt = dynamic(() =>
  import('@/components/InstallPrompt').then((m) => m.InstallPrompt)
);
const SupportButton = dynamic(() =>
  import('@/components/SupportButton').then((m) => m.SupportButton)
);
import { TelemetryTrackerDynamic as TelemetryTracker } from '@/components/TelemetryTrackerDynamic';

export const viewport: Viewport = {
  themeColor: '#4c1d95',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mppolice.zenscroll.app';

export const metadata: Metadata = {
  title: {
    default: 'MP Police Elite - Crack MP Police 2026 | Bilingual Tests & PYQs',
    template: '%s | MP Police Elite',
  },
  description:
    'MP Police Constable Paper I: GK & reasoning, mental ability, science & simple arithmetic — bilingual practice, PYQs, dashboard, and structured explanations with Indian Tiranga inspired design.',
  keywords: [
    'MP Police Constable Paper I',
    'MP Police 2026 syllabus',
    'MP Police PYQ',
    'MP Police test series Hindi English',
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    title: 'MP Police 2026 Elite Test Series | सर्वोत्तम अभ्यास 👮‍♂️',
    description:
      'MP Police Constable Paper I prep: official 40+30+30 sections, bilingual MCQs, PYQ hub, dashboard & test history.',
    siteName: 'MP Police Elite',
    images: [
      {
        url: '/mp-police-logo.png',
        width: 1024,
        height: 1024,
        alt: 'MP Police Elite - Crack MP Police 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MP Police Elite | Best App for MP Police 2026',
    description: 'Bilingual MP Police Constable Paper I practice: PYQs, analytics, and smart explanations.',
    images: ['/mp-police-logo.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

import { AppHeader } from '@/components/layout/AppHeader';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MP Police Elite',
    url: baseUrl,
    description: 'MP Police Constable Paper I — bilingual tests, PYQs, dashboard, and structured explanations.',
    publisher: {
      '@type': 'Organization',
      name: 'Mindful MP Police',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/mp-police-logo.png`,
      },
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Mindful MP Police',
    url: baseUrl,
    logo: `${baseUrl}/mp-police-logo.png`,
    description: 'Specialized preparation platform for MP Police Constable and SI exams with bilingual test series.',
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MP Police Elite',
    operatingSystem: 'Web, Android, iOS',
    applicationCategory: 'EducationalApplication',
    offers: {
      '@type': 'Offer',
      price: '299',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1000',
    },
  };

  return (
    <html lang="en">
      <head>
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="schema-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '2337193063478696'); fbq('track', 'PageView');`,
          }}
        />
      </head>
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        <GlobalErrorBoundary>
          <PwaRegistry />
          <Providers>
            <Suspense fallback={null}>
              <AppHeader />
            </Suspense>
            <MainContentWrapper>{children}</MainContentWrapper>

            <AppFooter />
            <GlobalLockModal />
            <ScrollToTop />
          </Providers>
          <Suspense fallback={null}>
            <SupportButton />
          </Suspense>
          <TelemetryTracker />
          <Toaster position="top-right" richColors />
          <InstallPrompt />
          <VersionManager />
        </GlobalErrorBoundary>
        <Script
          id="service-worker-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
