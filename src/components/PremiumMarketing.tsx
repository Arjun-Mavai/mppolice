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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                {/* Basic Plan */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                     <Card className="border-2 border-slate-200 h-full hover:border-slate-300 transition-all shadow-md hover:shadow-lg">
                         <CardContent className="p-6 flex flex-col h-full">
                             <div className="text-left mb-6">
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">
                                     {language === 'hi' ? 'बेसिक' : 'Basic'}
                                 </h3>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-4xl font-extrabold text-slate-900">₹99</span>
                                     <span className="text-sm text-slate-500 font-medium">/year</span>
                                 </div>
                                 <p className="text-sm text-slate-500 mt-2">
                                     {language === 'hi' ? 'शुरुआती तैयारी के लिए' : 'For syllabus coverage'}
                                 </p>
                             </div>

                             <ul className="space-y-3 mb-8 flex-1 text-left">
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
                                 <li className="flex items-center gap-3 text-sm text-slate-400 line-through decoration-slate-400">
                                     <span className="w-5 h-5 flex items-center justify-center">✕</span>
                                     <span>{language === 'hi' ? 'कोई क्विज़ नहीं' : 'No Quizzes'}</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(99)}
                                variant="outline"
                                className="w-full h-12 font-bold border-slate-900 text-slate-900 hover:bg-slate-50"
                             >
                                 {language === 'hi' ? 'बेसिक चुनें' : 'Choose Basic'}
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>

                {/* Premium Plan */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg z-10 whitespace-nowrap">
                         RECOMMENDED
                     </div>
                     <Card className="border-2 border-indigo-500 h-full shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                         <CardContent className="p-6 flex flex-col h-full relative z-10">
                             <div className="text-left mb-6">
                                 <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                     {language === 'hi' ? 'प्रीमियम' : 'Premium'} <Zap className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                 </h3>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">₹299</span>
                                     <span className="text-sm text-slate-500 font-medium">/year</span>
                                 </div>
                                 <p className="text-sm text-indigo-600 font-medium mt-2">
                                     {language === 'hi' ? 'पूरी तरह से महारत हासिल करें' : 'Complete Mastery'}
                                 </p>
                             </div>

                             <ul className="space-y-3 mb-8 flex-1 text-left">
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                     <span>{language === 'hi' ? 'बेसिक की सभी सुविधाएँ' : 'Everything in Basic'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                     <span>{language === 'hi' ? 'विषयवार क्विज़' : 'Topic-wise Quizzes'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                      <span>{language === 'hi' ? 'फुल लेंथ मॉक टेस्ट' : 'Full Length Mock Tests'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                      <span>{language === 'hi' ? 'स्मार्ट रिव्यु & एनालिटिक्स' : 'Smart Review & Analytics'}</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(299)}
                                className="w-full h-12 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-indigo-200"
                             >
                                 {language === 'hi' ? 'प्रीमियम चुनें' : 'Get Complete Access'}
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>
            </div>

            <p className="text-xs text-center text-slate-400 mt-8 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> 
                {language === 'hi' ? 'सुरक्षित भुगतान • 7 दिन की मनी-बैक गारंटी' : 'Secure Payment • 7-Day Money Back Guarantee'}
            </p>
        </div>
    );
}
