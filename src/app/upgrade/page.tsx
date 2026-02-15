'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { PremiumExplanationSection } from '@/components/home/PremiumExplanationSection';
import { InstantFeedbackSection } from '@/components/home/InstantFeedbackSection';
import { SubjectMasterySection } from '@/components/home/SubjectMasterySection';
import { ContentSuiteSection } from '@/components/home/ContentSuiteSection';
import { AppInstallGuide } from '@/components/home/AppInstallGuide';

// Below-fold sections — keep dynamic for performance but consolidate if possible
const DualLanguageShowcase = dynamic(() =>
  import('@/components/home/DualLanguageShowcase').then((m) => ({
    default: m.DualLanguageShowcase,
  }))
);
const FlashCardsSection = dynamic(() =>
  import('@/components/home/FlashCardsSection').then((m) => ({ default: m.FlashCardsSection }))
);
const ExamSimulationSection = dynamic(() =>
  import('@/components/home/ExamSimulationSection').then((m) => ({
    default: m.ExamSimulationSection,
  }))
);
const PricingSection = dynamic(() =>
  import('@/components/home/PricingSection').then((m) => ({ default: m.PricingSection }))
);

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
