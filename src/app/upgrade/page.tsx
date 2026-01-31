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
    Languages
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

export default function UpgradePage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const { language, setLanguage } = useSettingsStore();

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
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/syllabus" className="font-bold text-xl font-display text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20">
                      <span className="font-bold text-xs tracking-tighter">MP</span>
                  </div>
                  <span className="tracking-tight">MPPSC<span className="text-indigo-600">26</span></span>
              </Link>
              <div className="flex items-center gap-4">
                  <Button variant="ghost" className="font-semibold text-slate-600 hover:bg-slate-100 rounded-full px-6" onClick={() => router.push('/syllabus')}>
                    {language === 'hi' ? 'बंद करें' : 'Close'}
                  </Button>
              </div>
          </div>
          {/* Progress Bar */}
          <motion.div 
            className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-size-200 animate-gradient-x origin-left"
            style={{ scaleX: scrollYProgress }}
          />
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-slate-50 border-b border-slate-200">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl -mr-60 -mt-60 opacity-60 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl -ml-40 -mb-40 opacity-60"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-indigo-100 text-sm font-bold text-indigo-600 shadow-lg shadow-indigo-100/50"
              >
                 <Zap className="w-4 h-4 fill-indigo-600" />
                 {language === 'hi' ? 'संपूर्ण MPPSC तैयारी सूट' : 'Complete MPPSC Preparation Suite'}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.1]"
              >
                  {language === 'hi' ? 'सिलेबस से' : 'From Syllabus to'} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
                      {language === 'hi' ? 'चयन तक।' : 'Selection.'}
                  </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                  {language === 'hi' ? 'MPPSC के लिए सबसे उन्नत अध्ययन मंच।' : 'The most advanced study platform built for MPPSC.'}
                  <br className="hidden md:block"/>
                  <strong>
                    {language === 'hi' ? 'फ्लैशकार्ड के साथ सीखें। AI के साथ अभ्यास करें। एनालिटिक्स के साथ मास्टर करें।' : 'Learn with Flashcards. Practice with AI. Master with Analytics.'}
                  </strong>
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-6 pt-8"
              >
                  {/* LANGUAGE TOGGLE - Centered and Intuitive */}
                  <div className="flex items-center gap-4 bg-slate-100/50 p-2 pr-4 rounded-full border border-slate-200 backdrop-blur-sm">
                      <div className="flex bg-white rounded-full shadow-sm p-1 border border-slate-100">
                        <button 
                             onClick={() => setLanguage('en')}
                             className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all duration-300", language === 'en' ? "bg-slate-900 text-white shadow-md relative z-10" : "text-slate-500 hover:text-slate-900")}
                         >
                            English
                        </button>
                        <button 
                             onClick={() => setLanguage('hi')}
                             className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all duration-300", language === 'hi' ? "bg-indigo-600 text-white shadow-md relative z-10" : "text-slate-500 hover:text-indigo-600")}
                         >
                            हिंदी
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
                          <Languages className="w-3.5 h-3.5" />
                          {language === 'hi' ? 'भाषा चुनें' : 'Choose Language'}
                      </span>
                  </div>

                  <Button 
                      onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                      className="h-16 px-12 rounded-full text-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto ring-4 ring-slate-100"
                  >
                      {language === 'hi' ? 'प्रीमियम एक्सेस प्राप्त करें' : 'Get Premium Access'}
                  </Button>
              </motion.div>
          </div>
      </section>


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

       {/* Pricing Section */}
       <section id="pricing" className="py-24 bg-white relative">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
           <div className="max-w-5xl mx-auto px-4">
                <PremiumMarketing onUnlock={handleUnlock} />
           </div>
       </section>

       {/* Footer */}
       <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-800">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex flex-col items-center md:items-start gap-4">
                   <div className="flex items-center gap-2">
                       <div className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                           <Sparkles size={20} />
                       </div>
                       <span className="font-bold text-white text-2xl tracking-tight">Mindful</span>
                   </div>
                   <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                       Empowering MPPSC aspirants with technology, analytics, and quality content.
                   </p>
               </div>
               <div className="text-sm font-medium">
                   © 2024 Mindful Education. All rights reserved.
               </div>
           </div>
       </footer>
    </div>
  );
}
