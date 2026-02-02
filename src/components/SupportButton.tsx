"use client" 
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from "@/store/useSettingsStore";
export function SupportButton() {
  const { user } = useSettingsStore();
  const telegramBotLink = "https://t.me/mppss_26_bot";

  // Hide for logged in users
  if (user) return null;  

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
      <button
        onClick={() => window.open(telegramBotLink, '_blank')}
        className={cn(
          "w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl border-4 border-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        )}
      >
         {/* Bot Icon Look */}
        <MessageCircle className="w-7 h-7 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
      </button>
    </div>
  );
}
