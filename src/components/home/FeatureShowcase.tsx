'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, ShieldCheck, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function FeatureShowcase() {
  const { language } = useSettingsStore();

  return (
    <section className="relative overflow-hidden bg-slate-900 py-32 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="animate-pulse-slow pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-slate-500/20 blur-[100px]"></div>
      <div className="animate-pulse-slow pointer-events-none absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[100px] delay-700"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <Badge className="mb-6 rounded-full border border-slate-500/20 bg-slate-500/10 px-4 py-1.5 text-slate-300 backdrop-blur-md">
            <Crown size={14} className="mr-1.5" />
            {language === 'hi' ? 'प्रीमियम अनुभव' : 'Premium Experience'}
          </Badge>
          <h2 className="mb-6 bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl">
            {language === 'hi' ? 'टॉपर्स के लिए डिज़ाइन किया गया।' : 'Designed for Toppers.'}
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            {language === 'hi'
              ? 'एक अव्यवस्था-मुक्त, फोकस-संचालित इंटरफ़ेस जो आपकी तैयारी को प्राथमिकता देता है। सुंदर डार्क मोड, स्मूथ एनिमेशन और कोई डिस्ट्रैक्शन नहीं।'
              : 'A clutter-free, focus-driven interface that puts your preparation first. Beautiful dark mode, smooth animations, and zero distractions.'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Speed */}
          <motion.div whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="group h-full border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-110">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                {language === 'hi' ? 'बेहद तेज़' : 'Blazing Fast'}
              </h3>
              <p className="leading-relaxed text-slate-400">
                {language === 'hi'
                  ? 'कोई लोडिंग स्पिनर नहीं। प्रश्न तुरंत लोड होते हैं और परिणाम सेकंडों में। आधुनिक तकनीक पर निर्मित।'
                  : 'No loading spinners. Instant question rendering and result calculation. Built on modern architecture.'}
              </p>
            </Card>
          </motion.div>

          {/* Card 2: Mobile First */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          >
            <Card className="group h-full border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-purple-500 shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                {language === 'hi' ? 'मोबाइल फर्स्ट' : 'Mobile First'}
              </h3>
              <p className="leading-relaxed text-slate-400">
                {language === 'hi'
                  ? 'कहीं भी पढ़ाई करें। पूरा ऐप टच इंटरैक्शन के लिए अनुकूलित है, जो आपके फोन पर नेटिव ऐप जैसा अनुभव देता है।'
                  : 'Study on the go. Entire app is optimized for touch interactions, ensuring a native app-like feel on your phone.'}
              </p>
            </Card>
          </motion.div>

          {/* Card 3: Security */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          >
            <Card className="group h-full border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-110">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                {language === 'hi' ? 'सुरक्षित और निजी' : 'Secure & Private'}
              </h3>
              <p className="leading-relaxed text-slate-400">
                {language === 'hi'
                  ? 'आपका डेटा आपका है। हम आपकी प्रगति और भुगतान के लिए उच्च-स्तरीय एन्क्रिप्शन का उपयोग करते हैं। कोई विज्ञापन नहीं।'
                  : 'Your data is yours. We use enterprise-grade encryption for your progress data and payments. No ads, ever.'}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center">
            <span className="mb-4 text-sm font-bold tracking-widest text-slate-500 uppercase">
              {language === 'hi' ? '1000+ छात्रों द्वारा विश्वसनीय' : 'Trusted by 1000+ Aspirants'}
            </span>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-bold text-slate-400"
                >
                  U{i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
