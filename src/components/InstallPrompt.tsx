"use client";

import { useState, useEffect } from "react";
import { usePwa } from "@/hooks/usePwa";
import { X, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const { isInstallable, installPwa, isPwaInstalled } = usePwa();
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

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

  useEffect(() => {
    if (isInstallable && !dismissed) {
         requestAnimationFrame(() => setIsVisible(true));
    }
  }, [isInstallable, dismissed]);

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
                "fixed bottom-4 left-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 md:max-w-md md:mx-auto transition-all duration-500 ease-in-out transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0"
            )}
        >
            <button 
                onClick={handleDismiss} 
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
            >
                <X size={20} />
            </button>
            <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                        {/* Use the new icon here if you want */}
                        <span className="text-slate-900 font-bold text-lg">MP</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">Install Mindful MPPSC</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Install this app on your iPhone for a better experience.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                            1. Tap the <Share size={14} className="text-blue-400" /> Share button
                            </div>
                            <div className="flex items-center gap-2">
                            2. Scroll down and tap <span className="font-bold text-white">Add to Home Screen</span> <PlusSquare size={14} />
                            </div>
                    </div>
                </div>
            </div>
            {/* Pointer arrow for iOS bottom bar */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45 border-b border-r border-slate-700 md:hidden"></div>
        </div>
    );
  }

  // Render Android/Desktop Prompt (when beforeinstallprompt is captured)
  if (isInstallable) {
    return (
        <div
            className={cn(
                "fixed bottom-4 left-4 right-4 z-50 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 md:max-w-md md:mx-auto transition-all duration-500 ease-in-out transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0"
            )}
        >
                <button 
                onClick={handleDismiss} 
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-900"
            >
                <X size={20} />
            </button>
            <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-900/20">
                        <span className="font-bold text-lg">MP</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">Install App</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Add to Home Screen for quick access and full screen experience.
                    </p>
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDismiss}
                    className="flex-1 rounded-xl"
                >
                    Maybe Later
                </Button>
                <Button 
                    size="sm" 
                    onClick={installPwa}
                    className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                    Install Now
                </Button>
            </div>
        </div>
    );
  }

  return null;
}
