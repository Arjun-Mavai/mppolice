"use client";

import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { PremiumExplanationSection } from '@/components/home/PremiumExplanationSection';
import { InstantFeedbackSection } from '@/components/home/InstantFeedbackSection';
import { SubjectMasterySection } from '@/components/home/SubjectMasterySection';
import { ContentSuiteSection } from '@/components/home/ContentSuiteSection';
import { DualLanguageShowcase } from '@/components/home/DualLanguageShowcase';
import { FlashCardsSection } from '@/components/home/FlashCardsSection';
import { ExamSimulationSection } from '@/components/home/ExamSimulationSection';
import { PricingSection } from '@/components/home/PricingSection';

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">
      <HeroSection />
      <PremiumExplanationSection />
      <InstantFeedbackSection />
      <SubjectMasterySection />
      <ContentSuiteSection />
      <DualLanguageShowcase />
      <FlashCardsSection />
      <ExamSimulationSection />
      <PricingSection />
    </div>
  );
}
