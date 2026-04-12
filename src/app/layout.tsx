import type { Metadata, Viewport } from 'next';
// import { Outfit, Playfair_Display } from 'next/font/google';
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

// const outfit = Outfit({
//   subsets: ['latin'],
//   variable: '--font-outfit',
//   display: 'swap',
// });

// const playfair = Playfair_Display({
//   subsets: ['latin'],
//   variable: '--font-playfair',
//   display: 'swap',
// });

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
    default: 'Mindful MP Police - Crack MP Police 2026 | Bilingual Tests & Mnemonics',
    template: '%s | Mindful MP Police',
  },
  description:
    "Master the new MP Police 2026 pattern with India's first bilingual mnemonic-based platform. Get 100+ topic tests, 5+ years PYQs, and smart explanations in Hindi & English.",
  keywords: [
    'MP Police 2026 Test Series',
    'MP Police Prelims Mock Test',
    'MP Police Previous Year Papers',
    'MP Police Mnemonics',
    'MP Police Notes Hindi',
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    title: 'MP Police 2026 Elite Test Series | नवीनतम पैटर्न पर आधारित सर्वश्रेष्ठ अभ्यास',
    description:
      'Looking for MP Police 2026 Test Series? Get 5+ Years PYQs, Topic-wise Tests, and Mnemonics in Hindi & English. The smartest way to clear MP Police Prelims.',
    siteName: 'Mindful MP Police',
    images: [
      {
        url: '/og-hero.webp',
        width: 1200,
        height: 630,
        alt: 'Mindful MP Police - Crack MP Police 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mindful MP Police | Best App for MP Police 2026',
    description: "Master MP Police with India's first Bilingual Mnemonic App.",
    images: ['/og-hero.webp'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mindful MP Police',
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
  // 1. Fetch User on Server (Once per request)
  const user = await verifyAuth();

  // 🛡️ SECURITY: Exam Type Isolation
  // If a user with a different exam type (like MPPSC or UPSC) somehow logs in,
  // we redirect them to the dashboard or a common landing if applicable.
  // This ensures they don't see MP Police specific premium content.
  if (user && user.examType !== 'mppolice' && user.examType !== 'all') {
     // If they are admin, they might be allowed, but for regular users, redirect.
     if (user.role !== 'admin') {
        redirect('/dashboard'); // Or any other safe landing page
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

  // JSON-LD structured data — helps Google show rich results
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mindful MP Police',
    url: baseUrl,
    description:
      'The #1 App for MP Police 2026 Preparation with Mnemonics, Bilingual Notes, Tests & Quizzes',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/blogs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Mindful MP Police',
    url: baseUrl,
    description: "India's first bilingual mnemonic-based MP Police preparation platform",
    sameAs: [],
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
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Facebook Pixel Code */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '2337193063478696'); fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2337193063478696&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        {/* End Facebook Pixel Code */}
      </head>
      <body
        className={`bg-gray-50 font-sans text-gray-900 antialiased`}
      >
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
