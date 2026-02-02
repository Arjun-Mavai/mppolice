'use client';

import Link from 'next/link';

export function AppFooter() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <p className="font-bold text-slate-900">Mindful MPPSC</p>
                    <p className="text-sm text-slate-500">© 2026 All rights reserved.</p>
                </div>
                
                <div className="flex gap-6 text-sm font-medium text-slate-600">
                    <Link href="/contact" className="hover:text-indigo-600 transition-colors">
                        Contact Us
                    </Link>
                    <Link href="#" className="hover:text-indigo-600 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="#" className="hover:text-indigo-600 transition-colors">
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
