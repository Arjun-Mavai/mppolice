'use client';

import { useState, useEffect } from 'react';
import { usePwa } from '@/hooks/usePwa';
import { X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function InstallPrompt() {
  const { isInstallable, installPwa, isPwaInstalled } = usePwa();
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect iOS - Modern check including iPads
    const isIosDevice = 
      /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(!!isIosDevice);

    // Detect Mobile (Android/iOS) for the main prompt
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(isMobileDevice);

    // If iOS and not standalone, show prompt after a delay (once per session)
    if (isIosDevice && !isPwaInstalled && !sessionStorage.getItem('ios-prompt-dismissed')) {
      const timer = setTimeout(() => {
        setShowIosPrompt(true);
        // Small delay to allow render before animation
        requestAnimationFrame(() => setIsVisible(true));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPwaInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setDismissed(true);
      setShowIosPrompt(false);
      if (isIos) {
        sessionStorage.setItem('ios-prompt-dismissed', 'true');
      }
    }, 300); // Wait for transition
  };

  // Don't render structure if strictly dismissed/installed and not showing
  if ((isPwaInstalled || dismissed) && !showIosPrompt) return null;

  // Render iOS Prompt
  if (showIosPrompt) {
    return (
      <div
        className={cn(
          'fixed right-4 bottom-6 left-4 z-50 transform rounded-3xl border border-white/10 bg-[#0b081a]/90 p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] md:mx-auto md:max-w-md',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <X size={18} />
        </button>
        
        <div className="flex gap-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl">
             <div className="absolute inset-0 rounded-2xl bg-white/10" />
             <span className="relative text-xl font-black text-white">M</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-base font-black tracking-tight">Install Mindful App</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Get the full premium experience on your iPhone. No App Store needed.
            </p>
            
            <div className="mt-4 space-y-3 rounded-2xl bg-white/5 p-4 border border-white/5">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-black">
                   <Share size={14} />
                </div>
                <span>Tap the <span className="text-amber-500">Share</span> button below</span>
              </div>
              
              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-black">
                   <PlusSquare size={14} />
                </div>
                <span>Select <span className="text-amber-500">Add to Home Screen</span></span>
              </div>
            </div>

            <button 
               onClick={() => {
                  const el = document.getElementById('install-guide');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.location.href = '/#install-guide';
               }}
               className="mt-4 text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
            >
               View Full Guide →
            </button>
          </div>
        </div>
        
        {/* Pointer arrow for iOS bottom bar */}
        <div className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-r border-b border-white/10 bg-[#0b081a]/90 md:hidden"></div>
      </div>
    );
  }

  // Render Android/Desktop Prompt (when beforeinstallprompt is captured)
  if (isInstallable) {
    return (
      <div
        className={cn(
          'fixed right-4 bottom-6 left-4 z-50 transform rounded-3xl border border-white/10 bg-[#0b081a]/95 p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] md:mx-auto md:max-w-md',
          isVisible && isMobile ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl">
             <span className="text-xl font-black">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black tracking-tight text-white">Full App Experience</h3>
            <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
              Faster access, full screen mode, and offline capability.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1 h-11 rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
            Later
          </Button>
          <Button
            size="sm"
            onClick={installPwa}
            className="flex-1 h-11 rounded-xl bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/20 font-black text-xs uppercase tracking-widest"
          >
            Install
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
