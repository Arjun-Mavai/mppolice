// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 CENTRALIZED PRICING — Single source of truth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Used by: PremiumMarketing, /pricing page, /admin/pricing, /api/pricing
// Change features/defaults here → reflects everywhere.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PricingData {
  litePrice: number;
  liteOriginalPrice: number;
  liteValidityText: string;
  liteMonths: number;
  proPrice: number;
  proOriginalPrice: number;
  proValidityText: string;
  proMonths: number;
  upgradePrice: number;
  upgradeOriginalPrice: number;
  urgencyText: string;
  urgencyTextHi: string;
  studentsBought: number;
}

export const PRICING_DEFAULTS: PricingData = {
  litePrice: 99,
  liteOriginalPrice: 299,
  liteValidityText: 'Valid till MP Police 2026 Prelims',
  liteMonths: 8,
  proPrice: 199,
  proOriginalPrice: 999,
  proValidityText: 'Valid for 12 Months',
  proMonths: 12,
  upgradePrice: 199,
  upgradeOriginalPrice: 299,
  urgencyText: 'Special pricing for first 100 students',
  urgencyTextHi: 'पहले 100 छात्रों के लिए विशेष मूल्य',
  studentsBought: 23,
};

// Icon types for pricing page (lucide icon components)
export interface PlanFeature {
  en: string;
  hi: string;
}

export interface PlanFeatureWithIcon extends PlanFeature {
  icon?: string; // lucide icon name for mapping
}

// ── Lite Plan Features ────────────────────────────────────
export const LITE_FEATURES: PlanFeatureWithIcon[] = [
  {
    en: 'Limited PYQs with Analysis',
    hi: 'सीमित PYQ पेपर्स (Analysis के साथ)',
    icon: 'BookOpen',
  },
  { en: 'Full Length Test ×1', hi: 'फुल लेंथ टेस्ट ×1', icon: 'FileText' },
  { en: 'Limited Chapter-wise Tests', hi: 'सीमित चैप्टर-वाइज टेस्ट', icon: 'Target' },
  {
    en: 'Limited Syllabus Topics Analysis',
    hi: 'सीमित सिलेबस टॉपिक्स एनालिसिस',
    icon: 'BarChart3',
  },
  { en: 'Premium Study Blogs (Limited)', hi: 'प्रीमियम स्टडी ब्लॉग्स (सीमित)', icon: 'FileText' },
];

// ── Pro Plan Features ─────────────────────────────────────
export const PRO_FEATURES: PlanFeatureWithIcon[] = [
  { 
    en: '1000+ Important Facts Rapid Revision ke liye', 
    hi: '1000+ महत्वपूर्ण तथ्य तेज़ रिवीज़न के लिए', 
    icon: 'Zap' 
  },
  { 
    en: 'PYQs ke saath Exam Pattern samjho', 
    hi: 'PYQs के साथ परीक्षा पैटर्न समझें', 
    icon: 'BookOpen' 
  },
  { 
    en: 'Topic-Wise Tests Weak Areas Improve karne ke liye', 
    hi: 'कमज़ोर क्षेत्रों को सुधारने के लिए टॉपिक-वाइज़ टेस्ट', 
    icon: 'Target' 
  },
  { 
    en: 'Full Mock Tests Real Practice ke liye', 
    hi: 'असली प्रैक्टिस के लिए फुल मॉक टेस्ट', 
    icon: 'FileText' 
  },
  { 
    en: 'Instant Explanation se Concepts Clear karo', 
    hi: 'तुरंत व्याख्या से कॉन्सेप्ट क्लिअर करें', 
    icon: 'BadgeCheck' 
  },
  { 
    en: 'Progress Tracking aur Test History', 
    hi: 'प्रोग्रेस ट्रैकिंग और टेस्ट हिस्ट्री', 
    icon: 'History' 
  },
  {
    en: 'MP Police 2026 Exam Tak Access',
    hi: 'MP Police 2026 परीक्षा तक एक्सेस',
    icon: 'Clock'
  }
];

// Helper: compute discount percentage
export function calcDiscount(price: number, originalPrice: number): number {
  return Math.round((1 - price / originalPrice) * 100);
}

// Helper: compute monthly cost
export function calcMonthly(price: number, months: number): number {
  return Math.round(price / months);
}
