"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Zap, BookOpen, Layers, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PremiumMarketingProps {
    onUnlock: (amount: number) => void;
}

export function PremiumMarketing({ onUnlock }: PremiumMarketingProps) {
    const { language } = useSettingsStore();

    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 min-h-[500px] flex flex-col items-center text-center">
            
            <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1 mb-6 hover:bg-indigo-200 transition-colors cursor-default">
                <Star className="w-3 h-3 mr-1 fill-current" /> 
                {language === 'hi' ? 'प्रीमियम प्लान चुनें' : 'CHOOSE YOUR PLAN'}
            </Badge>

            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 mb-2">
                {language === 'hi' ? 'अपनी जरूरत के अनुसार' : 'Select the Perfect'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {language === 'hi' ? 'प्लान चुनें' : 'Plan for You'}
                </span>
            </h2>

            <p className="text-slate-500 mb-12 max-w-md mx-auto text-lg leading-relaxed">
                {language === 'hi' 
                    ? 'अपनी तैयारी को सही दिशा दें।' 
                    : 'Choose the plan that fits your preparation needs.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
                {/* Basic Plan */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ y: -8 }}
                    className="relative group"
                >
                     <Card className="border-0 ring-1 ring-slate-200 h-full hover:ring-slate-300 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-md">
                         <CardContent className="p-8 flex flex-col h-full">
                             <div className="text-left mb-6">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                         {language === 'hi' ? 'बेसिक' : 'Basic Plan'}
                                     </h3>
                                     <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold border-0">
                                         67% OFF
                                     </Badge>
                                 </div>
                                 
                                 <div className="flex items-baseline gap-2 mt-4">
                                     <span className="text-sm text-slate-400 font-medium line-through decoration-slate-400">₹299</span>
                                     <span className="text-5xl font-extrabold text-slate-900 tracking-tight">₹99</span>
                                     <span className="text-sm text-slate-500 font-bold">/year</span>
                                 </div>
                                 <p className="text-sm text-slate-500 mt-3 font-medium">
                                     {language === 'hi' ? 'शुरुआती तैयारी के लिए आदर्श' : 'Perfect for syllabus coverage'}
                                 </p>
                             </div>

                             <ul className="space-y-4 mb-8 flex-1 text-left">
                                 <li className="flex items-center gap-3 text-sm text-slate-700">
                                     <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                     <span>{language === 'hi' ? 'पूरा सिलेबस (10 यूनिट्स)' : 'Full Syllabus (10 Units)'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700">
                                     <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                     <span>{language === 'hi' ? 'बेसिक निमोनिक्स' : 'Basic Mnemonics'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700">
                                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <span>{language === 'hi' ? 'यूनिट रीडिंग मोड' : 'Unit Reading Mode'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-400 opacity-60">
                                     <span className="w-5 h-5 flex items-center justify-center font-bold">✕</span>
                                     <span>{language === 'hi' ? 'क्विज़ और टेस्ट सीरीज़' : 'No Quizzes & Tests'}</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(99)}
                                variant="outline"
                                className="w-full h-14 rounded-2xl font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all text-base"
                             >
                                 {language === 'hi' ? 'बेसिक चुनें' : 'Get Basic Access'}
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>

                {/* Premium Plan */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ y: -8 }}
                    className="relative group"
                >
                     <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-orange-500/20 z-20 whitespace-nowrap tracking-wide flex items-center gap-1">
                         <Zap size={12} className="fill-white" /> {language === 'hi' ? 'अर्ली बर्ड ऑफर' : 'EARLY BIRD OFFER'}
                     </div>
                     
                     <Card className="border-0 h-full shadow-2xl relative overflow-hidden ring-4 ring-indigo-500/10 group-hover:ring-indigo-500/20 transition-all duration-500">
                         {/* Dynamic Background */}
                         <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white opacity-100"></div>
                         <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                         
                         <CardContent className="p-8 flex flex-col h-full relative z-10">
                             <div className="text-left mb-6">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                         {language === 'hi' ? 'प्रीमियम प्रो' : 'Premium Pro'} 
                                         <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Best Value</span>
                                     </h3>
                                     <Badge className="bg-rose-100 text-rose-600 font-bold border-0 hover:bg-rose-100">
                                         70% OFF
                                     </Badge>
                                 </div>

                                 <div className="flex items-baseline gap-2 mt-4">
                                     <span className="text-sm text-slate-400 font-medium line-through decoration-slate-400">₹999</span>
                                     <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">₹299</span>
                                     <span className="text-sm text-slate-500 font-bold">/year</span>
                                 </div>
                                 <p className="text-sm text-indigo-600 font-medium mt-3 flex items-center gap-1.5">
                                     <Trophy size={14} />
                                     {language === 'hi' ? 'सफलता के लिए संपूर्ण पैकेज' : 'Complete Success Package'}
                                 </p>
                             </div>

                             <ul className="space-y-4 mb-8 flex-1 text-left">
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                                     <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                     </div>
                                     <span>{language === 'hi' ? 'बेसिक की सभी सुविधाएँ' : 'Everything in Basic'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                     <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                     </div>
                                     <span>{language === 'hi' ? 'विषयवार क्विज़ (अनलिमिटेड)' : 'Topic-wise Quizzes (Unlimited)'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                     </div>
                                      <span>{language === 'hi' ? 'फुल लेंथ मॉक टेस्ट (FLTs)' : 'Full Length Mock Tests'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                     </div>
                                      <span>{language === 'hi' ? 'स्मार्ट रिव्यु & एनालिटिक्स' : 'Smart Review & Analytics'}</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(299)}
                                className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] transition-all text-base relative overflow-hidden group/btn"
                             >
                                 <span className="relative z-10 flex items-center justify-center gap-2">
                                     {language === 'hi' ? 'प्रीमियम अनलॉक करें' : 'Get Premium Access'} <Zap size={18} className="fill-yellow-400 text-yellow-500" />
                                 </span>
                                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>
            </div>

            {/* <p className="text-xs text-center text-slate-400 mt-8 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> 
                {language === 'hi' ? 'सुरक्षित भुगतान • 7 दिन की मनी-बैक गारंटी' : 'Secure Payment • 7-Day Money Back Guarantee'}
            </p> */}
        </div>
    );
}
