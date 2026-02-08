'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

    // 🚫 Quiz play page pe footer nahi dikhana — user test de raha hai, bhagao isko!
    if (pathname.startsWith('/syllabus/quiz/play')) return null;

    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <p className="font-bold text-slate-900">Mindful MPPSC</p>
                    <p className="text-sm text-slate-500">© 2026 All rights reserved.</p>
                </div>
                
                <div className="flex gap-6 text-sm font-medium text-slate-600">
                    <Link href="/feedback" className="hover:text-slate-900 transition-colors">
                        Feedback
                    </Link>
                    <Link href="/contact" className="hover:text-slate-900 transition-colors">
                        Contact Us
                    </Link>
                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-slate-900 transition-colors">
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
