'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, MessageSquare, Mail, Shield, FileText } from 'lucide-react';

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
        <footer className="bg-slate-50 border-t border-slate-200 py-12 pb-24 md:pb-12 min-h-[250px] sm:min-h-[200px]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
                
                {/* Brand Section */}
                <div className="text-center md:text-left order-last md:order-first w-full md:w-auto">
                    <p className="font-bold text-slate-900 text-lg">Mindful MPPSC</p>
                    <p className="text-sm text-slate-500 mt-1">© 2026 All rights reserved.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Made with ❤️ for MP</p>
                </div>
                
                {/* Mobile Grid Layout (Icons + Text) */}
                <div className="grid grid-cols-3 gap-3 w-full md:hidden">
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
                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm active:scale-95 transition-all"
                        >
                            <div className="p-2 bg-slate-50 rounded-full text-slate-600">
                                <link.icon size={18} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{link.name}</span>
                        </Link>
                    ))}
                </div>

                {/* Desktop Horizontal Layout (Text Only) */}
                <div className="hidden md:flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="/about" className="hover:text-slate-900 transition-colors">About Us</Link>
                    <Link href="/feedback" className="hover:text-slate-900 transition-colors">Feedback</Link>
                    <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact Us</Link>
                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
                </div>
            </div>
        </footer>
    );
}
