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
    const { language, user } = useSettingsStore();
    const isLiteUser = user?.plan_tier === 'lite';

    // Lite Upgrade View
    if (isLiteUser) {
        return (
            <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 min-h-[500px] flex flex-col items-center text-center justify-center">
                 <Badge className="bg-amber-100 text-amber-700 px-3 py-1 mb-6 hover:bg-amber-200 transition-colors cursor-default border-amber-200">
                    <Star className="w-3 h-3 mr-1 fill-current" /> 
                    {language === 'hi' ? 'अपग्रेड उपलब्ध है' : 'UPGRADE AVAILABLE'}
                </Badge>

                <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 mb-2">
                    {language === 'hi' ? 'अपनी तैयारी को' : 'Supercharge Your'} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        {language === 'hi' ? 'अगले स्तर पर ले जाएं' : 'Preparation'}
                    </span>
                </h2>

                <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    {language === 'hi' 
                        ? 'प्रो प्लान पर अपग्रेड करें और अनलिमिटेड क्विज़, टेस्ट और स्मार्ट एनालिसिस अनलॉक करें। केवल ₹199 में।' 
                        : 'Upgrade to Pro and unlock Unlimited Quizzes, Tests, and Smart Analytics. Just pay the difference.'}
                </p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group w-full max-w-md"
                >
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-1 rounded-full text-xs font-bold shadow-lg shadow-indigo-500/20 z-20 whitespace-nowrap tracking-wide">
                         {language === 'hi' ? 'खास आपके लिए ऑफर' : 'SPECIAL UPGRADE OFFER'}
                     </div>
                     
                     <Card className="border-0 shadow-2xl relative overflow-hidden ring-4 ring-indigo-500/10 hover:ring-indigo-500/20 transition-all duration-300">
                         <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white opacity-100"></div>
                         
                         <CardContent className="p-8 flex flex-col relative z-10">
                             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                 <div className="text-left">
                                     <h3 className="text-xl font-bold text-slate-900">Pro Upgrade</h3>
                                     <p className="text-xs text-slate-500">From Lite Plan</p>
                                 </div>
                                 <div className="text-right">
                                     <div className="flex items-baseline gap-1 justify-end">
                                        <span className="text-sm text-slate-400 line-through">₹299</span>
                                        <span className="text-3xl font-black text-indigo-600">₹199</span>
                                     </div>
                                 </div>
                             </div>

                             <ul className="space-y-3 mb-8 text-left">
                                 <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                     <span>Unlimited Topic Tests</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                     <span>Unlimited Unit Tests</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                     <span>Full Length Mock Tests (FLTs)</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(199)}
                                className="w-full h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all"
                             >
                                 Upgrade Now for ₹199
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>
                
                {/* <p className="text-xs text-slate-400 mt-6">
                    Changes will reflect immediately after payment confirmation.
                </p> */}
            </div>
        )
    }

    // Standard View (Free Users)
    // return (
    // Standard View (Free Users)
    return (
        <div className="p-6 md:p-12 bg-slate-50 min-h-[500px] flex flex-col items-center text-center">
            
            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 px-4 py-1.5 mb-6 shadow-sm">
                <Star className="w-3 h-3 mr-2 fill-slate-400 text-slate-400" /> 
                {language === 'hi' ? 'प्रीमियम प्लान चुनें' : 'CHOOSE YOUR PLAN'}
            </Badge>

            <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900 mb-4 tracking-tight">
                {language === 'hi' ? 'अपनी जरूरत के अनुसार' : 'Select the Perfect'} <br />
                <span className="text-indigo-600">
                    {language === 'hi' ? 'प्लान चुनें' : 'Plan for You'}
                </span>
            </h2>

            <p className="text-slate-500 mb-12 max-w-md mx-auto text-lg leading-relaxed font-medium">
                {language === 'hi' 
                    ? 'अपनी तैयारी को सही दिशा दें।' 
                    : 'Choose the plan that fits your preparation needs.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                {/* Basic Plan */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group h-full"
                >
                     <Card className="border border-slate-200 shadow-sm h-full hover:shadow-md transition-all bg-white">
                         <CardContent className="p-8 flex flex-col h-full">
                             <div className="text-left mb-6">
                                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                                     {language === 'hi' ? 'बेसिक' : 'Basic'}
                                 </h3>
                                 <p className="text-sm text-slate-500 font-medium mb-4">
                                     {language === 'hi' ? 'शुरुआत करने वालों के लिए' : 'For Beginners'}
                                 </p>
                                 
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-4xl font-black text-slate-900 tracking-tighter">₹99</span>
                                     <span className="text-sm text-slate-400 font-medium line-through ml-2">₹299</span>
                                 </div>
                             </div>
                            
                             <div className="w-full h-px bg-slate-100 mb-6"></div>

                             <ul className="space-y-4 mb-8 flex-1 text-left">
                                 <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                     <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                     <span>{language === 'hi' ? 'बेसिक सिलेबस टॉपिक्स (10 यूनिट्स)' : 'Basic Understanding (10 Units)'}</span>
                                 </li>
                                 <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                     <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                     <span>{language === 'hi' ? 'सभी ब्लॉग मुफ्त पढ़ें' : 'All Blogs Access'}</span>
                                 </li>
                                 <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                      <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                      <span>{language === 'hi' ? 'सीमित प्रैक्टिस टेस्ट' : 'Limited Practice Tests'}</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(99)}
                                variant="outline"
                                className="w-full h-11 rounded-lg font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                             >
                                 {language === 'hi' ? 'मूल बातें शुरू करें' : 'Start with Basics'}
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>

                {/* Premium Plan */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group h-full"
                >
                     <Card className="border-2 border-indigo-600 shadow-xl h-full relative overflow-hidden bg-white">
                         <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                             Recommended
                         </div>
                         
                         <CardContent className="p-8 flex flex-col h-full relative z-10">
                             <div className="text-left mb-6">
                                 <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-2">
                                     {language === 'hi' ? 'प्रीमियम प्रो' : 'Premium Pro'} 
                                 </h3>
                                 <p className="text-sm text-indigo-600/80 font-medium mb-4">
                                     {language === 'hi' ? 'सफलता के लिए संपूर्ण पैकेज' : 'Complete Success Package'}
                                 </p>

                                 <div className="flex items-baseline gap-2">
                                     <span className="text-4xl font-black text-slate-900 tracking-tighter">₹299</span>
                                     <span className="text-sm text-slate-400 font-medium line-through">₹999</span>
                                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">70% OFF</span>
                                 </div>
                             </div>

                             <div className="w-full h-px bg-slate-100 mb-6"></div>

                             <ul className="space-y-4 mb-8 flex-1 text-left">
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                                     <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                     <span>{language === 'hi' ? 'बेसिक की सभी सुविधाएँ' : 'Everything in Basic'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                     <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                     <span>{language === 'hi' ? 'विषयवार क्विज़ (अनलिमिटेड)' : 'Topic-wise Quizzes (Unlimited)'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                      <span>{language === 'hi' ? 'फुल लेंथ मॉक टेस्ट (FLTs)' : 'Full Length Mock Tests'}</span>
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                      <span>{language === 'hi' ? 'स्मार्ट रिव्यु & एनालिटिक्स' : 'Smart Review & Analytics'}</span>
                                 </li>
                             </ul>

                             <Button 
                                onClick={() => onUnlock(299)}
                                className="w-full h-11 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                             >
                                 {language === 'hi' ? 'प्रीमियम अनलॉक करें' : 'Get Premium Access'}
                             </Button>
                         </CardContent>
                     </Card>
                </motion.div>
            </div>
        </div>
    ); 
    // {
        /* <p className="text-xs text-center text-slate-400 mt-8 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> 
                {language === 'hi' ? 'सुरक्षित भुगतान • 7 दिन की मनी-बैक गारंटी' : 'Secure Payment • 7-Day Money Back Guarantee'}
            </p> */}
        // </div>
    // );
// }
