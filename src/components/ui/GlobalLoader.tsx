import React from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative">
                <div className="h-16 w-16 rounded-xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 animate-bounce">
                    <span className="text-white font-bold text-xl tracking-tighter">MP</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-widest">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    );
}
