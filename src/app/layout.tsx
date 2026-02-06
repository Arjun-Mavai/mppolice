import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import PwaRegistry from "@/components/PwaRegistry";
import { Suspense } from "react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mppsc.vercel.app/";
export const metadata: Metadata = {
  title: {
    default: "Mindful MPPSC | Crack MPPSC 2026 with Mnemonics",
    template: "%s | Mindful MPPSC"
  },
  description: "The #1 App for MPPSC 2026. Master the syllabus 10x faster with creative Mnemonics, Bilingual Notes (Hindi/English), and Daily Quizzes. Start for free today!",
  keywords: ["MPPSC 2026", "MPPSC Mnemonics", "MPPSC Notes Hindi", "MPPSC Syllabus", "MPPSC PYQs", "Best MPPSC App", "Mindful MPPSC"],
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    title: "Mindful MPPSC - Crack MPPSC with Mnemonics",
    description: "Don't just read, REMEMBER. The only app with dedicated mnemonics for the entire MPPSC syllabus in Hindi & English.",
    siteName: "Mindful MPPSC",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindful MPPSC | Best App for MPPSC 2026",
    description: "Master MPPSC with India's first Bilingual Mnemonic App.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mindful MPPSC",
  },
};

import { SupportButton } from "@/components/SupportButton";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlobalLockModal } from "@/components/GlobalLockModal";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${playfair.variable} antialiased font-sans bg-gray-50 text-gray-900`}
      >
        <PwaRegistry />
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        <AppFooter />
        <GlobalLockModal />
        <ScrollToTop />
        <Suspense fallback={null}>
          <SupportButton />
        </Suspense>
        <Toaster position="top-right"  richColors/>
      </body>
    </html>
  );
}

