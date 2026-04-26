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
    en: '1000+ One-Liners with Detailed Explanation', 
    hi: '1000+ वन-लाइनर्स (विस्तृत व्याख्या सहित)', 
    icon: 'Zap' 
  },
  { 
    en: 'Best-in-class PYQ with Step-by-Step Logic', 
    hi: 'सर्वश्रेष्ठ PYQ समाधान (स्टेप-बाय-स्टेप लॉजिक)', 
    icon: 'BookOpen' 
  },
  { 
    en: 'Chapter-wise & Subject-wise Tests', 
    hi: 'चैप्टर-वाइज और विषय-वार टेस्ट', 
    icon: 'Target' 
  },
  { 
    en: 'Full Length Mock Tests (Latest Pattern)', 
    hi: 'फुल लेंथ मॉक टेस्ट (नवीनतम पैटर्न)', 
    icon: 'FileText' 
  },
  { en: 'Smart Analytics Dashboard', hi: 'स्मार्ट एनालिटिक्स डैशबोर्ड', icon: 'BarChart3' },
  // { en: 'Premium Study Blogs & Strategy', hi: 'प्रीमियम स्टडी ब्लॉग्स और रणनीति', icon: 'FileText' },
  { en: 'Test History for Revision', hi: 'रिवीज़न के लिए टेस्ट हिस्ट्री', icon: 'History' },
];

// Helper: compute discount percentage
export function calcDiscount(price: number, originalPrice: number): number {
  return Math.round((1 - price / originalPrice) * 100);
}

// Helper: compute monthly cost
export function calcMonthly(price: number, months: number): number {
  return Math.round(price / months);
}
