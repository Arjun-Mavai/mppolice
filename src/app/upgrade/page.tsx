"use client";

import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    Zap, 
    Target, 
    CheckCircle2, 
    BarChart3,
    Trophy,
    Clock,
    ChevronRight,
    Map,
    BookOpen,
    BrainCircuit,
    Lightbulb,
    RotateCw,
    ArrowUpRight,
    X,
    TrendingUp,
    Languages,
    Brain,
    AlertTriangle,
    FileText,
    History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PremiumMarketing } from '@/components/PremiumMarketing';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress"
import { useSettingsStore } from '@/store/useSettingsStore';
import { AppFooter } from '@/components/layout/AppFooter';
import { DualLanguageShowcase } from '@/components/home/DualLanguageShowcase';
import { FeatureShowcase } from '@/components/home/FeatureShowcase';
import { HeroSection } from '@/components/home/HeroSection'; // Added import

import { getTopicTestStats } from '@/actions/getTopicTestStats';

export default function UpgradePage() {
  const router = useRouter();
  // const { scrollYProgress } = useScroll(); // Unused
  const { language, setLanguage, user: globalUser } = useSettingsStore(); // Still needed for other sections
  
  const [topicCount, setTopicCount] = React.useState(0);

  React.useEffect(() => {
      // Fetch dynamic stats for landing page
      getTopicTestStats().then(res => {
          if (res.success && res.data) {
              // Sum up all topics with > 0 questions
              let total = 0;
              Object.values(res.data).forEach(topics => {
                  total += topics.filter(t => t.questionCount > 0).length;
              });
              setTopicCount(total);
          }
      });
  }, []);

  const [isFlipped, setIsFlipped] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  const handleUnlock = (amount: number) => {
      router.push(`/payment?amount=${amount}`);
  };

  // Mock Demo State
  const [mockStep, setMockStep] = React.useState<'intro' | 'active' | 'result'>('intro');
  const [mockQIndex, setMockQIndex] = React.useState(0);
  const [mockScore, setMockScore] = React.useState(0);
  const [mockSelected, setMockSelected] = React.useState<number | null>(null);

  const mockQuestions = [
    {
        id: 1,
        q: "Which article of the Constitution deals with the Election Commission?",
        q_hi: "संविधान का कौन सा अनुच्छेद चुनाव आयोग से संबंधित है?",
        options: ["Article 324", "Article 325", "Article 326", "Article 328"],
        options_hi: ["अनुच्छेद 324", "अनुच्छेद 325", "अनुच्छेद 326", "अनुच्छेद 328"],
        correct: 0
    },
    {
        id: 2,
        q: "Who was the first Governor of Madhya Pradesh?",
        q_hi: "मध्य प्रदेश के प्रथम राज्यपाल कौन थे?",
        options: ["H.V. Pataskar", "Pattabhi Sitaramayya", "K.C. Reddy", "S.N. Sinha"],
        options_hi: ["एच.वी. पाटस्कर", "पट्टाभि सितारमैया", "के.सी. रेड्डी", "एस.एन. सिन्हा"],
        correct: 1
    },
    {
        id: 3,
        q: "Kalidas Samman is given in which text?",
        q_hi: "कालिदास सम्मान किस क्षेत्र में दिया जाता है?",
        options: ["Folk Art", "Classical Music", "Literature", "All of these"],
        options_hi: ["लोक कला", "शास्त्रीय संगीत", "साहित्य", "ये सभी"],
        correct: 3
    },
    {
        id: 4,
        q: "River Narmada originates from?",
        q_hi: "नर्मदा नदी का उद्गम स्थल है?",
        options: ["Multai", "Amarkantak", "Jana-Pava", "Kakri-Bardi"],
        options_hi: ["मुलताई", "अमरकंटक", "जना-पावा", "काकरी-बर्डी"],
        correct: 1
    }
  ];

  const handleMockStart = () => {
    setMockStep('active');
    setMockQIndex(0);
    setMockScore(0);
    setMockSelected(null); // Reset selection
  };
  
  const handleMockAnswer = (idx: number) => {
    if (mockSelected !== null) return; // Prevent double click
    setMockSelected(idx);
    
    // Simulate delay then next
    setTimeout(() => {
        if (idx === mockQuestions[mockQIndex].correct) {
            setMockScore(s => s + 1);
        }
        
        if (mockQIndex < mockQuestions.length - 1) {
            setMockQIndex(prev => prev + 1);
            setMockSelected(null);
        } else {
            setMockStep('result');
        }
    }, 800);
  };

  React.useEffect(() => {
    // Auto-flip demo sequence
    const timer1 = setTimeout(() => setIsFlipped(true), 1500); // Show back
    const timer2 = setTimeout(() => setIsFlipped(false), 4500); // Show front again

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
    };
  }, []);

  const handleCardClick = () => {
      setHasInteracted(true);
      setIsFlipped(!isFlipped);
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section */}
      <HeroSection />


      {/* --- FEATURE SECTION 1: FLIP CARDS (WHITE) --- */}
      <section className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-8 order-2 lg:order-1">
                       <Badge variant="outline" className="px-4 py-1 text-sm border-indigo-200 text-indigo-700 bg-indigo-50">
                            {language === 'hi' ? 'सक्रिय शिक्षण' : 'Active Learning'}
                       </Badge>
                       <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {language === 'hi' ? 'इंटरैक्टिव फ्लैशकार्ड्स।' : 'Interactive Flash Cards.'}
                       </h2>
                       <p className="text-lg text-slate-600 leading-relaxed font-medium">
                           {language === 'hi' 
                            ? 'रटने की जरूरत नहीं। हमारे फ्लैशकार्ड्स "Active Recall" तकनीक का उपयोग करते हैं, जिससे आप तारीखें, वंश और अनुच्छेद चुटकियों में याद कर लेंगे।'
                            : 'Never forget a fact again. Our curated flashcards use active recall to help you memorize Dates, Dynasties, and Articles effortlessly.'}
                       </p>
                       <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                    <RotateCw className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{language === 'hi' ? 'स्मार्ट रोटेशन' : 'Smart Rotation'}</h4>
                                    <p className="text-slate-600">{language === 'hi' ? 'जवाब देखने के लिए टैप करें। अगले कार्ड के लिए स्वाइप करें।' : 'Tap to reveal key facts. Swipe to next.'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Lightbulb className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{language === 'hi' ? 'निमोनिक्स (स्मरण सूत्र)' : 'Mnemonics Included'}</h4>
                                    <p className="text-slate-600">{language === 'hi' ? 'जटिल विषयों को याद रखने के लिए आसान ट्रिक्स।' : 'Complex topics broken down into easy memory tricks.'}</p>
                                </div>
                            </div>
                       </div>
                  </div>
                  
                  {/* Visual */}
                  <div className="order-1 lg:order-2 perspective-1000 flex justify-center lg:justify-end">
                     <div 
                        className="group h-80 w-full max-w-md bg-transparent cursor-pointer [perspective:1000px] select-none"
                        onClick={handleCardClick}
                      >
                          <motion.div 
                            className="relative h-full w-full shadow-2xl transition-all duration-700 [transform-style:preserve-3d] hover:shadow-indigo-500/20 rounded-3xl"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                                {/* Front */}
                                <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center [backface-visibility:hidden]">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <Target size={120} />
                                    </div>
                                    <span className="text-7xl text-slate-100 font-serif absolute top-6 left-6 font-bold">01</span>
                                    
                                    {/* Icon */}
                                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center mb-8 rotate-3 transform group-hover:rotate-6 transition-transform">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>

                                    <h3 className="text-3xl font-extrabold text-slate-900 text-center">
                                        {language === 'hi' ? 'मध्य प्रदेश का इतिहास' : 'History of MP'}
                                    </h3>
                                    <span className="mt-4 px-4 py-1.5 bg-slate-100 rounded-full text-slate-500 text-sm font-semibold flex items-center gap-2">
                                        <RotateCw size={14} /> {language === 'hi' ? 'पलटने के लिए टैप करें' : 'Tap to Flip'}
                                    </span>
                                </div>
                                
                                {/* Back */}
                                <div className="absolute inset-0 h-full w-full bg-slate-900 rounded-3xl border border-slate-800 p-8 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between overflow-hidden">
                                     {/* Texture */}
                                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 text-white"></div>
                                     <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>

                                     <div className="relative">
                                         <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            {language === 'hi' ? 'विषय विश्लेषण' : 'Topic Analysis'}
                                         </div>
                                         <h4 className="text-2xl font-bold text-white">
                                            {language === 'hi' ? 'राजवंश और राजधानियाँ' : 'Dynasties & Capitals'}
                                         </h4>
                                     </div>
                                    
                                    <ul className="space-y-3 relative">
                                        <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                            <span className="text-sm font-medium">Holkar: <span className="text-slate-300">{language === 'hi' ? 'इंदौर (मालवा)' : 'Indore (Malwa)'}</span></span>
                                        </li>
                                        <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                            <span className="text-sm font-medium">Scindia: <span className="text-slate-300">{language === 'hi' ? 'ग्वालियर' : 'Gwalior'}</span></span>
                                        </li>
                                         <li className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                            <span className="text-sm font-medium">Bundela: <span className="text-slate-300">{language === 'hi' ? 'ओरछा' : 'Orchha'}</span></span>
                                        </li>
                                    </ul>

                                    <div className="relative mt-2 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
                                        <div className="text-xs text-amber-300 font-bold uppercase mb-1 flex items-center gap-1">
                                            <Lightbulb size={12} /> {language === 'hi' ? 'स्मरण सूत्र' : 'Mnemonic'}
                                        </div>
                                        <div className="text-sm font-medium text-amber-100">
                                            "Holkar In Doors" (Indore)
                                        </div>
                                    </div>
                                </div>
                          </motion.div>
                     </div>
                  </div>
              </div>
          </div>
      </section>

         {/* --- FEATURE SECTION 5: THE PREMIUM EXPLANATION (THE GIMMICK) --- */}
       <section className="py-24 bg-slate-50 border-t border-slate-200">
           <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge variant="outline" className="px-4 py-1 text-sm border-purple-200 text-purple-700 bg-purple-50 mb-6 rounded-full">
                        {language === 'hi' ? 'प्रीमियम व्याख्या' : 'Premium Explanations'}
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        {language === 'hi' ? 'सिर्फ उत्तर नहीं,' : 'More Than Just Answers.'} <br />
                        <span className="text-indigo-600">{language === 'hi' ? 'संपूर्ण कांसेप्ट सीखें।' : 'Master The Concept.'}</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        {language === 'hi'
                         ? 'हर प्रश्न के साथ मिलती है एक विस्तृत, संरक्षित व्याख्या जो आपको रटने की जगह समझने में मदद करती है।'
                         : 'Every question comes with a structured breakdown designed to help you learn, retain, and eliminate wrong options.'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                     {/* The Card Visualization */}
                     <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] opacity-10 blur-xl"></div>
                        <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden relative z-10 bg-white">
                            {/* Question Header */}
                            <div className="bg-slate-50 p-6 border-b border-slate-100">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                                        Which river is known as the "Ganga of Madhya Pradesh"?
                                        <br />
                                        <span className="text-slate-500 font-medium text-base mt-1 block">
                                            मध्य प्रदेश की गंगा किस नदी को कहा जाता है?
                                        </span>
                                    </h3>
                                    <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-200 shrink-0">MP Geo</Badge>
                                </div>
                            </div>
                            
                            <div className="p-6 md:p-8 space-y-6">
                                {/* Answer Status */}
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Correct Answer</div>
                                        <div className="font-bold text-slate-900">Betwa (बेतवा)</div>
                                    </div>
                                </div>

                                {/* The 4 Gimmick Sections */}
                                <div className="space-y-4">
                                    {/* 1. Logic */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-emerald-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-1">
                                                <CheckCircle2 size={16} /> ✅ Core Logic
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Based on <span className="font-bold">pollution levels</span> like the Ganges, Betwa is called the Ganga of MP.
                                                <br/>
                                                <span className="text-slate-500 text-xs">(प्रदूषण के आधार पर इसे म.प्र. की गंगा कहा जाता है।)</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* 2. Exam Fact */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-blue-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-1">
                                                <Lightbulb size={16} /> 💡 Exam Fact
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Origin: <span className="font-bold">Kumra Gaon (Raisen)</span>. <br/>
                                                Total Length: <span className="font-bold">480 km</span>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3. Memory Tip */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-amber-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-1">
                                                <Brain size={16} /> 🧠 Memory Tip
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                "Betwa = Beta (Son) of Raisen" → Kumra Gaon.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 4. Scam Alert */}
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-red-500 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-1">
                                                <AlertTriangle size={16} /> 🚫 Scam Alert
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Don't confuse with <span className="font-bold text-red-600">Narmada</span>. Narmada is the <span className="underline">Lifeline</span> of MP, not the Ganga (based on sanctity/pollution distinction).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                     </div>

                     {/* Features List */}
                     <div className="space-y-10 lg:pt-10">
                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                                 <Brain size={24} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">{language === 'hi' ? 'स्मृति तकनीक (Mnemonics)' : 'Built-in Mnemonics'}</h3>
                                 <p className="text-slate-600 leading-relaxed">
                                     {language === 'hi' ? 'कठिन तथ्यों को याद रखने के लिए विशेष ट्रिक्स और सूत्र।' : 'Every explanation includes catchy mnemonics to help you retain dry facts forever.'}
                                 </p>
                             </div>
                         </div>
                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                                 <AlertTriangle size={24} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">{language === 'hi' ? 'ट्रैप अलर्ट' : 'Trap Alerts'}</h3>
                                 <p className="text-slate-600 leading-relaxed">
                                     {language === 'hi' ? 'जानें कि परीक्षार्थी अक्सर कहाँ गलती करते हैं और उन "जाल" से कैसे बचें।' : 'We highlight commonly confused options and historical "scams" so you never fall for them in the exam.'}
                                 </p>
                             </div>
                         </div>
                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                 <CheckCircle2 size={24} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">{language === 'hi' ? 'टू-द-पॉइंट लॉजिक' : 'To-The-Point Logic'}</h3>
                                 <p className="text-slate-600 leading-relaxed">
                                     {language === 'hi' ? 'सीधा और सटीक उत्तर। कोई अनावश्यक जानकारी नहीं।' : 'Direct reasoning without the fluff. Save time and absorb only what matters.'}
                                 </p>
                             </div>
                         </div>
                     </div>
                </div>
           </div>
       </section>

       {/* --- FEATURE SECTION 6: CONTENT SUITE (NUMBERS) --- */}
       <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                     <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        {language === 'hi' ? 'सब कुछ एक जगह।' : 'Everything You Need.'}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {language === 'hi' 
                         ? 'यूनिट टेस्ट से लेकर फुल लेंथ मॉक तक, आपकी तैयारी का पूरा भंडार।' 
                         : 'From Unit Tests to Full Length Mocks, we have structured content to take you from Zero to Hero.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {/* Unit Tests */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-slate-200 bg-slate-50/50">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">10</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Units Covered</div>
                            </div>
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] sm:text-xs">
                                {language === 'hi' ? '5 प्रयास / टेस्ट' : '5 Attempts / Test'}
                            </Badge>
                        </CardContent>
                    </Card>

                     {/* Topic Tests (NEW) */}
                     <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-rose-200 bg-rose-50/30">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">
                                   {topicCount > 0 ? topicCount : '100+'}
                                </div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Topic Wise Tests</div>
                            </div>
                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 text-[10px] sm:text-xs">
                                {language === 'hi' ? 'टॉपिक वार' : 'Topic Wise'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* FLTs */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-emerald-200 bg-emerald-50/30">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">5</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Full Length Tests</div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] sm:text-xs">
                                {language === 'hi' ? '3 प्रयास / टेस्ट' : '3 Attempts / Test'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* PYQ */}
                    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-amber-200 bg-amber-50/30">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                <History size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">5+</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Years PYQ</div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium pt-1">
                                {language === 'hi' ? '2021 से अब तक' : '2021 Onwards'}
                            </p>
                        </CardContent>
                    </Card>

                     {/* CSAT */}
                     <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-purple-200 bg-purple-50/30 lg:col-span-1 md:col-span-2 lg:col-start-auto">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <Brain size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900">3</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">CSAT Mocks</div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium pt-1">
                                {language === 'hi' ? 'अभ्यास के लिए' : 'For Practice'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
       </section>

      {/* --- FEATURE SECTION 2: INSTANT QUIZ (GREY) --- */}
      <section className="py-32 bg-slate-50 border-y border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                  {/* Visual First on Desktop */}
                  <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start">
                      <div className="relative w-full max-w-lg mx-auto lg:mx-0">
                          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] opacity-20 blur-xl animate-pulse-slow"></div>
                          <Card className="rounded-[2rem] shadow-2xl border-0 overflow-hidden relative z-10">
                              <div className="bg-white p-6 md:p-8 space-y-6">
                                  {/* Header */}
                                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                      <div>
                                          <div className="text-xs font-bold text-slate-400 uppercase">{language === 'hi' ? 'यूनिट 1 टेस्ट' : 'Unit 1 Test'}</div>
                                          <h3 className="font-bold text-slate-900">{language === 'hi' ? 'MP इतिहास क्विज़' : 'MP History Quiz'}</h3>
                                      </div>
                                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1 pl-1 pr-2">
                                          <Zap size={12} className="fill-amber-700" /> {language === 'hi' ? 'इंस्टेंट मोड' : 'Instant Mode'}
                                      </Badge>
                                  </div>
                                  
                                  {/* Question */}
                                  <div className="space-y-4">
                                      <p className="font-bold text-lg text-slate-900">
                                          {language === 'hi' ? 'चेदी साम्राज्य का सबसे पहला उल्लेख किस ग्रंथ में मिलता है?' : 'Which text provides the earliest mention of the Chedi Kingdom?'}
                                      </p>
                                      
                                      <div className="space-y-3">
                                          {/* Wrong Option */}
                                           <div className="p-4 rounded-xl border-2 border-red-100 bg-red-50/50 flex justify-between items-center cursor-not-allowed opacity-80">
                                              <span className="font-medium text-slate-700">{language === 'hi' ? 'महाभारत' : 'Mahabharata'}</span>
                                              <X className="w-5 h-5 text-red-500" />
                                          </div>
                                          
                                          {/* Correct Option */}
                                           <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 relative shadow-sm">
                                              <div className="flex justify-between items-center">
                                                  <span className="font-bold text-slate-900">{language === 'hi' ? 'ऋग्वेद' : 'Rigveda'}</span>
                                                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Explanation */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-in slide-in-from-top-4 fade-in duration-700">
                                       <div className="flex items-center gap-2 mb-2">
                                           <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{language === 'hi' ? 'व्याख्या' : 'Explanation'}</div>
                                       </div>
                                       <p className="text-sm text-slate-600 leading-relaxed">
                                           {language === 'hi' 
                                            ? <span><strong>ऋग्वेद</strong> में चेदी साम्राज्य का सबसे पहला संदर्भ (दानस्तुति सूक्ति) मिलता है।</span>
                                            : <span>The **Rigveda** contains the earliest reference to the Chedi kingdom (Danastuti hymn).</span>}
                                       </p>
                                  </div>
                              </div>
                          </Card>
                      </div>
                  </div>

                  <div className="space-y-8 order-1 lg:order-2 lg:pl-10">
                       <Badge variant="outline" className="px-4 py-1 text-sm border-amber-200 text-amber-700 bg-amber-50">
                            {language === 'hi' ? 'अभ्यास मोड' : 'Practice Mode'}
                       </Badge>
                       <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {language === 'hi' ? 'तुरंत फीडबैक।' : 'Instant Feedback.'}
                       </h2>
                       <p className="text-lg text-slate-600 leading-relaxed font-medium">
                           {language === 'hi' 
                            ? <span>रिजल्ट का इंतजार क्यों? <strong>इंस्टेंट मोड</strong> ऑन करें और हर सवाल के तुरंत बाद सही जवाब और व्याख्या देखें।</span>
                            : <span>Why wait for the results? Turn on <strong>Instant Mode</strong> to see the correct answer and detailed explanation immediately after every question.</span>}
                       </p>
                       <ul className="space-y-4">
                           <li className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                   <CheckCircle2 className="w-4 h-4 text-green-600" />
                               </div>
                               <span className="text-slate-700 font-medium text-lg">
                                    {language === 'hi' ? 'गलतियों का तुरंत सुधार' : 'Real-time correction'}
                               </span>
                           </li>
                           <li className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                   <BookOpen className="w-4 h-4 text-blue-600" />
                               </div>
                               <span className="text-slate-700 font-medium text-lg">
                                    {language === 'hi' ? 'प्रमाणिक स्रोतों से संदर्भ' : 'Detailed Source References'}
                               </span>
                           </li>
                       </ul>
                  </div>
              </div>
          </div>
      </section>


      {/* --- FEATURE SECTION 3: ANALYTICS ANALYTICS (WHITE) --- */}
      <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-8">
                       <Badge variant="outline" className="px-4 py-1 text-sm border-emerald-200 text-emerald-700 bg-emerald-50">
                            {language === 'hi' ? 'गहरी अंतर्दृष्टि' : 'Deep Insights'}
                       </Badge>
                       <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {language === 'hi' ? 'विषयवार प्रवीणता' : 'Subject-wise Mastery.'}
                       </h2>
                       <p className="text-lg text-slate-600 leading-relaxed font-medium">
                           {language === 'hi' 
                            ? 'सिर्फ मेहनत नहीं, स्मार्ट स्टडी करें। हमारा AI हर विषय में आपकी परफॉरमेंस को ट्रैक करता है, ताकि आप अपनी कमजोरियों को ताकत बना सकें।'
                            : "Don't just study hard, study smart. Our AI analyzes your performance in every subject to tell you exactly where to focus."}
                       </p>
                       <div className="flex gap-2 flex-wrap">
                           {['History (इतिहास)', 'Polity (राजव्यवस्था)', 'Geography (भूगोल)', 'Science (विज्ञान)'].map(tag => (
                               <div key={tag} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-600 font-semibold text-sm">
                                   {tag}
                               </div>
                           ))}
                       </div>
                  </div>

                  {/* Visual */}
                  <div className="flex justify-center lg:justify-end">
                       <div className="relative w-full max-w-lg">
                           <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] opacity-20 blur-xl"></div>
                           <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl rounded-[2rem] p-8 space-y-8 relative z-10">
                               <div className="flex justify-between items-end">
                                   <div>
                                       <div className="text-slate-400 font-medium mb-1">{language === 'hi' ? 'कुल स्कोर' : 'Overall Strength'}</div>
                                       <div className="text-4xl font-bold text-white flex items-center gap-2">
                                           74% <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded">+12%</span>
                                       </div>
                                   </div>
                                   <BarChart3 className="text-slate-600 w-8 h-8" />
                               </div>

                               <div className="space-y-6">
                                   <div className="space-y-2">
                                       <div className="flex justify-between text-sm">
                                           <span className="font-bold text-slate-300">{language === 'hi' ? 'MP इतिहास' : 'MP History'}</span>
                                           <span className="text-emerald-400 font-bold">{language === 'hi' ? 'उत्कृष्ट (85%)' : 'Excellent (85%)'}</span>
                                       </div>
                                       <Progress value={85} className="h-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-emerald-500 to-emerald-400" />
                                   </div>
                                   
                                   <div className="space-y-2">
                                       <div className="flex justify-between text-sm">
                                           <span className="font-bold text-slate-300">{language === 'hi' ? 'भारतीय राजव्यवस्था' : 'Indian Polity'}</span>
                                           <span className="text-amber-400 font-bold">{language === 'hi' ? 'अच्छा (65%)' : 'Good (65%)'}</span>
                                       </div>
                                       <Progress value={65} className="h-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-amber-500 to-amber-400" />
                                   </div>

                                   <div className="space-y-2">
                                       <div className="flex justify-between text-sm">
                                           <span className="font-bold text-slate-300">{language === 'hi' ? 'भूगोल' : 'Geography'}</span>
                                           <span className="text-red-400 font-bold">{language === 'hi' ? 'कमजोर (42%)' : 'Weak (42%)'}</span>
                                       </div>
                                       <Progress value={42} className="h-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-red-500 to-red-400" />
                                   </div>
                               </div>

                               <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4 items-start">
                                   <BrainCircuit className="w-6 h-6 text-purple-400 shrink-0" />
                                   <p className="text-sm text-slate-300 leading-relaxed">
                                       <span className="text-purple-400 font-bold">AI Suggestion:</span> {language === 'hi' ? 'यूनिट 3 के  भूगोल' : 'Focus on Geography'} {language === 'hi' ? 'प्रश्नों पर ध्यान दें। "नदियां और पर्वत" में आपकी सटीकता औसत से कम है।' : 'questions. Your accuracy is below average in "Rivers & Mountains".'}
                                   </p>
                               </div>
                           </Card>
                       </div>
                  </div>
              </div>
          </div>
      </section>



       {/* --- NEW: DUAL LANGUAGE SHOWCASE --- */}
       <DualLanguageShowcase />

       {/* --- NEW: FEATURE SHOWCASE (Best Looking) --- */}
       <FeatureShowcase />

       {/* --- FEATURE SECTION 4: REAL EXAM SIMULATION (GRADIENT) --- */}
       <section className="py-32 relative bg-slate-900 text-white overflow-hidden">
           {/* Background Mesh */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-950"></div>
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

           <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="grid lg:grid-cols-2 gap-20 items-center">
                   <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl opacity-75 blur-md animate-pulse"></div>
                            <Card className="bg-white text-slate-900 rounded-3xl border-0 overflow-hidden relative z-10 shadow-2xl transition-all duration-300 min-h-[500px] flex flex-col">
                                
                                {/* HEADER */}
                                <div className="bg-slate-950 text-white p-6 flex justify-between items-center bg-[url('/grid.svg')] shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", mockStep === 'active' ? "bg-red-500 animate-ping" : "bg-slate-500")} />
                                        <span className="font-bold text-sm tracking-widest uppercase text-slate-300">
                                            {mockStep === 'result' ? (language === 'hi' ? 'टेस्ट परिणाम' : 'Test Result') : (language === 'hi' ? 'लाइव मॉक टेस्ट' : 'Live Mock Test')}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* BODY */}
                                <div className="p-8 flex-1 flex flex-col justify-center">
                                    
                                    {/* INTRO STATE */}
                                    {mockStep === 'intro' && (
                                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Trophy className="w-10 h-10 text-rose-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                    {language === 'hi' ? "चुनौती के लिए तैयार हैं?" : "Ready to Challenge?"}
                                                </h3>
                                                <p className="text-slate-500 mt-2">
                                                    {language === 'hi' ? "अपनी तैयारी के स्तर को जांचने के लिए 4-प्रश्नों का डेमो टेस्ट लें।" : "Take a quick 4-question demo to see your preparation level."}
                                                </p>
                                            </div>
                                            <Button onClick={handleMockStart} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-rose-200">
                                                {language === 'hi' ? "डेमो टेस्ट शुरू करें" : "Start Demo Test"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* ACTIVE STATE */}
                                    {mockStep === 'active' && (
                                        <div className="space-y-6 w-full animate-in slide-in-from-right fade-in duration-300">
                                            <div className="flex gap-2 mb-2">
                                                {mockQuestions.map((_, idx) => (
                                                    <div key={idx} className={cn("h-1 flex-1 rounded-full transition-colors duration-300", idx <= mockQIndex ? "bg-rose-500" : "bg-slate-100")} />
                                                ))}
                                            </div>

                                            <h3 className="text-lg font-bold leading-snug min-h-[5rem] flex items-center">
                                                {language === 'hi' ? (mockQuestions[mockQIndex] as any).q_hi : mockQuestions[mockQIndex].q}
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                                {(language === 'hi' ? (mockQuestions[mockQIndex] as any).options_hi : mockQuestions[mockQIndex].options).map((opt: string, idx: number) => (
                                                    <div 
                                                         key={idx}
                                                         onClick={() => handleMockAnswer(idx)}
                                                         className={cn(
                                                             "p-4 rounded-xl border border-slate-200 cursor-pointer font-medium transition-all text-sm relative overflow-hidden",
                                                             mockSelected === null ? "hover:border-slate-900 hover:bg-slate-50" : 
                                                             (mockSelected === idx ? (idx === mockQuestions[mockQIndex].correct ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-red-50 border-red-500 text-red-900") : "opacity-50")
                                                         )}
                                                    >
                                                         {opt}
                                                         {mockSelected === idx && (
                                                             <div className="absolute right-3 top-3.5">
                                                                 {idx === mockQuestions[mockQIndex].correct ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-red-600" />}
                                                             </div>
                                                         )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* RESULT STATE */}
                                    {mockStep === 'result' && (
                                        <div className="text-center space-y-6 animate-in zoom-in fade-in duration-500">
                                            <div className="relative inline-block">
                                                 <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                                                 <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center relative border-4 border-white shadow-xl">
                                                     <div className="text-center">
                                                         <div className="text-3xl font-bold text-emerald-400">{mockScore}/4</div>
                                                         <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                                                     </div>
                                                 </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                    {mockScore === 4 ? (language === 'hi' ? "शानदार!" : "Outstanding!") : mockScore >= 2 ? (language === 'hi' ? "बहुत अच्छे!" : "Good Job!") : (language === 'hi' ? "सुधार की आवश्यकता है" : "Needs Work")}
                                                </h3>
                                                <p className="text-slate-500 text-sm">
                                                    {language === 'hi' ? "आप असली परीक्षा के लिए तैयार हैं। अब पूर्ण 100-प्रश्नों के मॉक टेस्ट अनलॉक करें।" : "You're ready for the real deal. Unlock full 100-question mock tests now."}
                                                </p>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-around text-center">
                                                 <div>
                                                     <div className="text-xl font-bold text-slate-900">92%</div>
                                                     <div className="text-xs text-slate-500">{language === 'hi' ? 'सटीकता' : 'Accuracy'}</div>
                                                 </div>
                                                 <div className="w-px bg-slate-200"></div>
                                                 <div>
                                                     <div className="text-xl font-bold text-slate-900">Top 5%</div>
                                                     <div className="text-xs text-slate-500">{language === 'hi' ? 'रैंक' : 'Rank'}</div>
                                                 </div>
                                            </div>
                                            
                                            <Button onClick={handleMockStart} variant="ghost" className="text-sm text-slate-400 hover:text-slate-900">
                                                {language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
                                            </Button>
                                        </div>
                                    )}

                                </div>
                            </Card>
                        </div>
                   </div>

                   <div className="space-y-8 order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-bold">
                            <Trophy size={14} /> {language === 'hi' ? 'परीक्षा तैयारी' : 'Exam Readiness'}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            {language === 'hi' ? 'वास्तविक परीक्षा सिमुलेशन।' : 'Real Exam Simulation.'}
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium">
                            {language === 'hi' 
                             ? '2 घंटे के मैराथन के लिए अपने दिमाग को प्रशिक्षित करें। असली परीक्षा जैसा इंटरफ़ेस, टाइमर दबाव और कठिनाई स्तर — अब आपके हाथ में।' 
                             : 'Train your brain for the 2-hour marathon. Full-length mock tests with the exact same interface, timer pressure, and difficulty level as the real exam.'}
                        </p>
                        <Button className="h-14 px-8 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold text-lg shadow-lg shadow-rose-600/20">
                            {language === 'hi' ? 'मुफ्त मॉक टेस्ट शुरू करें' : 'Start Free Mock Test'}
                        </Button>
                   </div>
               </div>
           </div>
       </section>


    

       {/* Pricing Section - Conditionally Render for Non-Subscribed Users */}
       {!(globalUser as any)?.is_subscribed && (
           <section id="pricing" className="py-24 bg-white relative">
               <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
               <div className="max-w-5xl mx-auto px-4">
                    <PremiumMarketing onUnlock={handleUnlock} />
               </div>
           </section>
       )}


    </div>
  );
}
