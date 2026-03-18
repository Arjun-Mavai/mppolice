
// src/features/tests/utils/cutoff-logic.ts

export type CutoffCategory = 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'PH';
export type Gender = 'M' | 'F';

export interface QualificationResult {
  qualified: boolean;
  cutoff: number;
  diff: number; // Positive if qualified, negative if missed
  categoryKey: string;
}

/**
 * Determines qualification based on score, category, and gender against cutoffs.
 * Keys expected in cutoffs JSON: "UR_OPEN", "UR_FEMALE", "OBC_OPEN", "OBC_FEMALE", etc.
 * Fallback to "_M" / "_F" suffix if standard keys not found.
 */
export function checkQualification(
  score: number,
  category: string,
  gender: string,
  cutoffs: Record<string, number> | null
): QualificationResult {
  if (!cutoffs || Object.keys(cutoffs).length === 0) {
    // If no cutoffs defined, return a neutral result
    return {
      qualified: true,
      cutoff: 0,
      diff: 0,
      categoryKey: 'N/A'
    };
  }

  // Determine lookup key
  // Standard format: "UR_OPEN", "UR_FEMALE"
  // Legacy/Simple format: "UR_M", "UR_F"
  
  const cat = category.toUpperCase();
  const gen = gender.toUpperCase();

  const genderSuffix = gen === 'F' || gen === 'FEMALE' ? 'FEMALE' : 'OPEN';
  const genderSuffixShort = gen === 'F' || gen === 'FEMALE' ? 'F' : 'M';

  // Try standard keys first
  const standardKey = `${cat}_${genderSuffix}`;
  const shortKey = `${cat}_${genderSuffixShort}`;

  let key = '';
  let cutoffScore = 0;

  if (cutoffs[standardKey] !== undefined) {
    key = standardKey;
    cutoffScore = cutoffs[standardKey];
  } else if (cutoffs[shortKey] !== undefined) {
    key = shortKey;
    cutoffScore = cutoffs[shortKey];
  } else {
    // Fallback: try finding just the category (e.g. "UR" for both)
    if (cutoffs[cat] !== undefined) {
      key = cat;
      cutoffScore = cutoffs[cat];
    } else {
       // Deep fallback: return 'N/A' but marked as 'failed' implicitly if strict
       // For now, assume if cutoff is missing, we can't judge qualification strictly
       return {
         qualified: false,
         cutoff: 0,
         diff: 0,
         categoryKey: `Missing (${standardKey})`
       };
    }
  }

  const diff = score - cutoffScore;
  const qualified = diff >= 0;

  return {
    qualified,
    cutoff: cutoffScore,
    diff: parseFloat(diff.toFixed(2)),
    categoryKey: key
  };
}
