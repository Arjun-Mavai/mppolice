"use client";

import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
 
export function BlogAccessDenied() {
    const router = useRouter();
 
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
                    <Lock className="w-10 h-10 text-yellow-400 fill-yellow-400/20" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg -rotate-12 border-4 border-white">
                    <Crown className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight">
                    Premium Content
                </h1>
                <p className="text-slate-600 leading-relaxed font-medium">
                     This Article is for <span className="font-bold text-slate-900">Pro & Lite Members</span> only. 
                    Upgrade to unlock exclusive strategies and notes!
                </p>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                        size="lg" 
                        onClick={() => router.push("/pricing")}
                        className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 px-8 rounded-xl font-bold h-12 shadow-xl shadow-slate-200"
                    >
                        Learn More & Upgrade
                    </Button>
                    <Button 
                        variant="ghost" 
                        asChild 
                        className="text-slate-500 hover:text-slate-900 font-bold"
                    >
                        <Link href="/blogs">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-16 p-6 rounded-2xl bg-slate-50 border border-slate-100 max-w-sm text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Why upgrade?</p>
                <ul className="space-y-2">
                    {[
                        "Complete MPPSC Pre + Mains Strategies",
                        "High-Yield Bilingual Test Series",
                        "Mnemonic-based learning for better recall"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-emerald-500 font-bold">✓</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
