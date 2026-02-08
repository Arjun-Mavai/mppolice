"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, ShieldCheck, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function FeatureShowcase() {
  const { language } = useSettingsStore();

  return (
    <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-slate-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-700"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <Badge className="bg-slate-500/10 text-slate-300 border border-slate-500/20 mb-6 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <Crown size={14} className="mr-1.5" /> 
                    {language === 'hi' ? 'प्रीमियम अनुभव' : 'Premium Experience'}
                </Badge>
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-slate-300">
                    {language === 'hi' ? 'टॉपर्स के लिए डिज़ाइन किया गया।' : 'Designed for Toppers.'}
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                    {language === 'hi' 
                        ? 'एक अव्यवस्था-मुक्त, फोकस-संचालित इंटरफ़ेस जो आपकी तैयारी को प्राथमिकता देता है। सुंदर डार्क मोड, स्मूथ एनिमेशन और कोई डिस्ट्रैक्शन नहीं।'
                        : 'A clutter-free, focus-driven interface that puts your preparation first. Beautiful dark mode, smooth animations, and zero distractions.'}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                 {/* Card 1: Speed */}
                 <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                 >
                    <Card className="bg-white/5 border-white/10 p-8 h-full backdrop-blur-sm hover:bg-white/10 transition-colors group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                            {language === 'hi' ? 'बेहद तेज़' : 'Blazing Fast'}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                            {language === 'hi'
                                ? 'कोई लोडिंग स्पिनर नहीं। प्रश्न तुरंत लोड होते हैं और परिणाम सेकंडों में। आधुनिक तकनीक पर निर्मित।'
                                : 'No loading spinners. Instant question rendering and result calculation. Built on modern architecture.'}
                        </p>
                    </Card>
                 </motion.div>

                 {/* Card 2: Mobile First */}
                 <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                 >
                    <Card className="bg-white/5 border-white/10 p-8 h-full backdrop-blur-sm hover:bg-white/10 transition-colors group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-400 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            <Smartphone className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                            {language === 'hi' ? 'मोबाइल फर्स्ट' : 'Mobile First'}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                            {language === 'hi'
                                ? 'कहीं भी पढ़ाई करें। पूरा ऐप टच इंटरैक्शन के लिए अनुकूलित है, जो आपके फोन पर नेटिव ऐप जैसा अनुभव देता है।'
                                : 'Study on the go. Entire app is optimized for touch interactions, ensuring a native app-like feel on your phone.'}
                        </p>
                    </Card>
                 </motion.div>

                 {/* Card 3: Security */}
                 <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                 >
                    <Card className="bg-white/5 border-white/10 p-8 h-full backdrop-blur-sm hover:bg-white/10 transition-colors group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                            {language === 'hi' ? 'सुरक्षित और निजी' : 'Secure & Private'}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
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
                    <span className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">
                        {language === 'hi' ? '1000+ छात्रों द्वारा विश्वसनीय' : 'Trusted by 1000+ Aspirants'}
                    </span>
                    <div className="flex -space-x-4">
                        {[1,2,3,4,5].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
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
