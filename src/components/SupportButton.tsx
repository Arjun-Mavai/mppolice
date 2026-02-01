 "use client" 
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from "@/store/useSettingsStore";

export function SupportButton() {
  const { isSubscribed } = useSettingsStore();
  const telegramBotLink = "https://t.me/mppss_26_bot";

  // Hide for Pro users
  if (isSubscribed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
      <button
        onClick={() => window.open(telegramBotLink, '_blank')}
        className={cn(
          "flex items-center gap-3 pl-5 pr-6 py-4 bg-slate-900 text-white rounded-full shadow-2xl border border-white/10 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
        )}
      >
        <MessageCircle className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-[11px] font-black uppercase tracking-[0.15em]">Contact Support</span>
      </button>
    </div>
  );
}
