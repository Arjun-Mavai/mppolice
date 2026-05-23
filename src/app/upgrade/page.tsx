// 🚀 Upgrade / Main Feature Showcase Page
// Bhai, ye page user ko pro features dikhata h. 
// Performance ke liye humne ise Server Component rakha h aur heavy sections ko dynamic import kiya h.

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';

// Below-fold sections — Bhai, inko dynamic rakha h taaki page load hote hi saara JS ek saath na download ho.
// Jab user scroll karega, tabhi ye load honge.

const PremiumExplanationSection = dynamic(() =>
  import('@/components/home/PremiumExplanationSection').then((m) => ({
    default: m.PremiumExplanationSection,
  }))
);
const PYQShowcaseSection = dynamic(() =>
  import('@/components/home/PYQShowcaseSection').then((m) => ({
    default: m.PYQShowcaseSection,
  }))
);
const InstantFeedbackSection = dynamic(() =>
  import('@/components/home/InstantFeedbackSection').then((m) => ({
    default: m.InstantFeedbackSection,
  }))
);
const SubjectMasterySection = dynamic(() =>
  import('@/components/home/SubjectMasterySection').then((m) => ({
    default: m.SubjectMasterySection,
  }))
);
const AppInstallGuide = dynamic(() =>
  import('@/components/home/AppInstallGuide').then((m) => ({ default: m.AppInstallGuide }))
);

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
      {/* 🔝 Hero Section: Ye sabse pehle dikhta h, isliye direct import (though internally it's client) */}
      <HeroSection />

      {/* 🛠 Feature Sections: Bhai ye scroll karne pe load hote hain (Optimized) */}
      <PremiumExplanationSection />
      <PYQShowcaseSection />
      <InstantFeedbackSection />
      <SubjectMasterySection />

      <AppInstallGuide />
      <DualLanguageShowcase />
      <FlashCardsSection />
      <ExamSimulationSection />
      
      {/* 💰 Pricing: Conversion ke liye sabse important section */}
      <PricingSection />
    </div>
  );
}
