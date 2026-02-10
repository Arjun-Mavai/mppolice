"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { PremiumExplanationSection } from '@/components/home/PremiumExplanationSection';

// Below-fold sections — lazy loaded for faster initial paint
const InstantFeedbackSection = dynamic(() => import('@/components/home/InstantFeedbackSection').then(m => ({ default: m.InstantFeedbackSection })), { ssr: false });
const SubjectMasterySection = dynamic(() => import('@/components/home/SubjectMasterySection').then(m => ({ default: m.SubjectMasterySection })), { ssr: false });
const ContentSuiteSection = dynamic(() => import('@/components/home/ContentSuiteSection').then(m => ({ default: m.ContentSuiteSection })), { ssr: false });
const DualLanguageShowcase = dynamic(() => import('@/components/home/DualLanguageShowcase').then(m => ({ default: m.DualLanguageShowcase })), { ssr: false });
const FlashCardsSection = dynamic(() => import('@/components/home/FlashCardsSection').then(m => ({ default: m.FlashCardsSection })), { ssr: false });
const ExamSimulationSection = dynamic(() => import('@/components/home/ExamSimulationSection').then(m => ({ default: m.ExamSimulationSection })), { ssr: false });
const PricingSection = dynamic(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })), { ssr: false });
const AppInstallGuide = dynamic(() => import('@/components/home/AppInstallGuide').then(m => ({ default: m.AppInstallGuide })), { ssr: false });


export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">
      <HeroSection />
      <PremiumExplanationSection />
      <InstantFeedbackSection />
      <SubjectMasterySection />
      <ContentSuiteSection />

      <AppInstallGuide />
      <DualLanguageShowcase />
      <FlashCardsSection />
      <ExamSimulationSection />
      <PricingSection />
    </div>
  );
}
 