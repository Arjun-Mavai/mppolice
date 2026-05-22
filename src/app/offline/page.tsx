'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, BookOpen, Compass, Award, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Curated list of premium offline MP Police exam prep tips
const OFFLINE_TIPS = [
  {
    icon: Compass,
    titleHi: "एमपी पुलिस सिलेबस टिप्स",
    titleEn: "MP Police Syllabus Tip",
    descHi: "ऑफलाइन समय का उपयोग मध्य प्रदेश के सामान्य ज्ञान (MP GK) को मन ही मन दोहराने में करें। प्रमुख नदियाँ और किले याद करें।",
    descEn: "Use offline time to revise Madhya Pradesh General Knowledge (MP GK) mentally. Focus on major rivers and historical forts."
  },
  {
    icon: BookOpen,
    titleHi: "रीजनिंग शॉर्टकट्स",
    titleEn: "Reasoning Shortcuts",
    descHi: "कोडिंग-डिकोडिंग और वर्णमाला अनुक्रम (Alphabet series) के मान याद रखें। यह परीक्षा में समय बचाने की बेहतरीन कुंजी है।",
    descEn: "Memorize coding-decoding and alphabet series positions. This is key to saving time during the actual exam."
  },
  {
    icon: Award,
    titleHi: "शारीरिक दक्षता परीक्षा (PET)",
    titleEn: "Physical Efficiency Test (PET)",
    descHi: "दौड़ (800m) और लंबी कूद के नियमों को याद रखें। स्वस्थ शरीर और निरंतर अभ्यास ही आपको सफलता दिलाएगा।",
    descEn: "Keep the rules of the 800m run and long jump in mind. Consistent practice and stamina are crucial for success."
  }
];

export default function OfflinePage() {
  const [activeTip, setActiveTip] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Monitor network status dynamically
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Tip rotation timer
    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % OFFLINE_TIPS.length);
    }, 6000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    setIsReconnecting(true);
    // Mimic reconnection delay for premium feel
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsReconnecting(false);
        // Dispatch toast style custom notification
        const notification = document.getElementById('offline-alert');
        if (notification) {
          notification.classList.remove('opacity-0', 'translate-y-4');
          notification.classList.add('opacity-100', 'translate-y-0');
          setTimeout(() => {
            notification.classList.remove('opacity-100', 'translate-y-0');
            notification.classList.add('opacity-0', 'translate-y-4');
          }, 3000);
        }
      }
    }, 1200);
  };

  const currentTip = OFFLINE_TIPS[activeTip];
  const TipIcon = currentTip.icon;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-center text-slate-100 overflow-hidden font-sans">
      
      {/* Sleek Premium Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 z-0" />

      {/* Floating alert toast */}
      <div 
        id="offline-alert" 
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/80 px-4 py-2 text-xs font-semibold text-red-300 shadow-xl shadow-black/50 backdrop-blur-md transition-all duration-300 opacity-0 translate-y-4 z-50 pointer-events-none"
      >
        <ShieldAlert className="h-4 w-4 text-red-400" />
        <span>अभी भी ऑफलाइन हैं! कृपया नेटवर्क जांचें। (Still Offline!)</span>
      </div>

      <div className="relative w-full max-w-lg z-10 space-y-8 px-2">
        {/* Animated Radar Pulse Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 border border-slate-800 shadow-inner relative group">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500" />
          <WifiOff className="h-10 w-10 text-indigo-400 relative z-10 animate-pulse" />
        </div>

        {/* Dynamic Headers */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-900/40 border border-indigo-500/30 px-3 py-1 text-[11px] font-bold text-indigo-300 uppercase tracking-wider animate-pulse">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Offline Mode / ऑफलाइन मोड
          </span>
          
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent sm:text-4xl">
            कनेक्शन नहीं मिल सका
          </h1>
          <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
            Seems you lost the signal. But don&apos;t worry, your progress is safe and your prep shouldn&apos;t stop.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs mx-auto">
          <Button 
            onClick={handleRetry} 
            disabled={isReconnecting}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'पुनः प्रयास जारी...' : 'पुनः प्रयास करें (Retry)'}</span>
          </Button>
        </div>

        {/* Highly polished Study Tip Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-500 hover:border-slate-700/80">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-tr-2xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950/80 border border-indigo-500/20 text-indigo-400">
              <TipIcon className="h-5 w-5 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-300 tracking-wide uppercase">
                  {currentTip.titleHi}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  | {currentTip.titleEn}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  {currentTip.descHi}
                </p>
                <p className="text-[11px] font-normal text-slate-500 leading-relaxed italic">
                  {currentTip.descEn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Footer Details */}
        <div className="pt-2 text-xs text-slate-500 font-medium space-y-1">
          <p>Mindful MP Police Exam Assistant</p>
          <p className="text-[10px] text-slate-600">Auto-saved local session active.</p>
        </div>
      </div>
    </div>
  );
}
