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

import { verifyAuth } from '@/lib/auth';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Fetch User on Server
  const user = await verifyAuth();

  // 🛡️ SECURITY: Exam Type Isolation
  if (user && user.examType !== 'mppolice' && user.examType !== 'all') {
     if (user.role !== 'admin') {
        redirect('/dashboard');
     }
  }

  // 2. Transform for Navbar
  const navbarUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        image: null,
        role: user.role || undefined,
        is_subscribed: user.isSubscribed ?? false,
        plan_tier: user.planTier ?? 'free',
      }
    : null;

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MP Police Elite',
    url: baseUrl,
    description: 'MP Police Constable Paper I — bilingual tests, PYQs, dashboard, and structured explanations.',
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
            <AppNavbar user={navbarUser} />
            <MainContentWrapper>{children}</MainContentWrapper>

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
