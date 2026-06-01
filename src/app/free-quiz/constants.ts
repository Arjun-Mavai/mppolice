// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏛️ MP Police SECTION CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Filter modal, listing page, aur tags me use hoga
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MP_Police_SECTIONS = [
  { id: 'sec_gk_reasoning', subject: 'GK & Reasoning', subjectHi: 'सामान्य ज्ञान एवं तर्कशक्ति' },
  { id: 'sec_mental_ability', subject: 'Intellectual & Mental Ability', subjectHi: 'बौद्धिक क्षमता एवं मानसिक क्षमता' },
  { id: 'sec_science_arithmetic', subject: 'Science & Simple Arithmetic', subjectHi: 'विज्ञान एवं सरल अंकगणित' },
] as const;

export const MP_Police_SUBJECTS = [
  { value: 'general_knowledge', label: 'General Knowledge', labelHi: 'सामान्य ज्ञान' },
  { value: 'mp_general_knowledge', label: 'MP GK', labelHi: 'म.प्र. सामान्य ज्ञान' },
  { value: 'general_science', label: 'Science', labelHi: 'विज्ञान' },
  { value: 'logical_reasoning', label: 'Reasoning', labelHi: 'तर्कशक्ति' },
  { value: 'quantitative_aptitude', label: 'Maths / Aptitude', labelHi: 'गणित / अभिरुचि' },
] as const;
