'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, MessageSquare, Mail, Shield, FileText, Send } from 'lucide-react';

/**
 * AppFooter — Global Footer Component (Tapori Docs 🎬)
 *
 * Bhai ye footer har page pe dikhta hai EXCEPT quiz play page!
 * Quiz play me user test de raha hai — waha footer dikhana = distraction
 *
 * Kaise kaam karta hai:
 * ─────────────────────
 * 1. usePathname() se current URL nikaalte hain
 * 2. Agar URL "/syllabus/quiz/play" se START hota hai → footer HIDE
 * 3. Baaki sab pages pe normal dikhega
 *
 * Ye Root Layout (src/app/layout.tsx) me render hota hai,
 * isliye nested layout se hide nahi kar sakte — yaha se hi path check karna padta hai
 */
export function AppFooter() {
  const pathname = usePathname();

  // 🚫 Quiz pages pe footer nahi dikhana — user test de raha hai ya prepare kar raha hai!
  if (pathname.startsWith('/syllabus/quiz')) return null;
  if (pathname.startsWith('/free-quiz')) return null;

  return (
    <footer className="min-h-[250px] border-t border-slate-200 bg-slate-50 py-12 pb-24 sm:min-h-[200px] md:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:gap-6">
        {/* Brand Section */}
        <div className="order-last w-full text-center md:order-first md:w-auto md:text-left">
          <p className="text-lg font-bold text-slate-900">MP Police Elite</p>
          <p className="mt-1 text-sm text-slate-500">© 2026 All rights reserved.</p>
          <div className="mt-4 flex items-center justify-center gap-4 md:justify-start">
            <a
              href="https://t.me/mppolice_26"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-sky-100 p-2 text-sky-600 transition-all hover:bg-sky-200 hover:scale-110"
              title="Join Telegram"
            >
              <Send size={18} />
            </a>
            <a
              href="https://www.youtube.com/@MPPOLICEZen-h2s"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-red-100 p-2 text-red-600 transition-all hover:bg-red-200 hover:scale-110"
              title="YouTube Channel"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                width="18"
                height="18"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
          <p className="mt-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">सत्यमेव जयते</p>
        </div>

        {/* Mobile Grid Layout (Icons + Text) */}
        <div className="grid w-full grid-cols-3 gap-3 md:hidden">
          {[
            { name: 'About', href: '/about', icon: Info },
            { name: 'Feedback', href: '/feedback', icon: MessageSquare },
            { name: 'Contact', href: '/contact', icon: Mail },
            { name: 'Privacy', href: '/privacy', icon: Shield },
            { name: 'Terms', href: '/terms', icon: FileText },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all active:scale-95"
            >
              <div className="rounded-full bg-slate-50 p-2 text-slate-600">
                <link.icon size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-700">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Desktop Horizontal Layout (Text Only) */}
        <div className="hidden flex-wrap justify-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/about" className="transition-colors hover:text-slate-900">
            About Us
          </Link>
          <Link href="/feedback" className="transition-colors hover:text-slate-900">
            Feedback
          </Link>
          <Link href="/contact" className="transition-colors hover:text-slate-900">
            Contact Us
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-slate-900">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-slate-900">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
