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
};

export const metadata: Metadata = {
  title: "Mindful MPPSC",
  description: "Master your MPPSC Syllabus with Mnemonics and Flashcards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mindful MPPSC",
  },
};

import { SupportButton } from "@/components/SupportButton";

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
        <SupportButton />
      </body>
    </html>
  );
}

