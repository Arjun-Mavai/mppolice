/**
 * Quiz Ranking Utility — Tapori Style 🔥
 * 
 * Bhai ye utility guest user ka rank nikaalti hai score ke basis pe.
 * Seedha formula hai: Score → Percentage → "Kitne students ko haraaya"
 * 
 * ⚠️ IMPORTANT BUG FIX (Feb 2026):
 * Pehle negative score aata tha jab user galat answers deta tha
 * (negative marking se score minus me jaata tha → percentage minus → 
 * "You beat -40 students" dikhta tha — MAALIK MAAF KARO! 😂)
 * 
 * Ab kya fix kiya:
 * 1. Score ko ZERO se neeche jaane hi nahi dete (Math.max(0, score))
 * 2. Percentage bhi 0-100 ke beech clamp kiya (Math.min(100, Math.max(0, ...)))
 * 3. Seed ALWAYS positive rakhte hain (Math.abs) — taki modulo bhi positive aaye
 * 
 * Ye DETERMINISTIC hai — same score = hamesha same rank (guest ko fake
 * variation nahi chahiye, consistent result chahiye har baar)
 */

export interface RankingResult {
  beaten: number;
  percentage: number;
  rank: number;
}

/**
 * calculateGuestRanking — Tapori Ranking Engine 🏆
 * 
 * @param rawScore - Score jo aaya (negative bhi ho sakta hai negative marking se!)
 * @param totalQuestions - Total sawaal the kitne
 * @returns { beaten, percentage, rank } — sab safe, sab positive, koi minus nahi
 * 
 * Formula breakdown (seedha simple):
 * ─────────────────────────────────
 * 1. rawScore ko clamp karo: Math.max(0, rawScore) → score kabhi minus nahi
 * 2. maxScore = totalQuestions × 3 (har sawaal 3 marks ka)
 * 3. percentage = (score / maxScore) × 100, clamped 0-100
 * 4. seed = Math.abs(score * 100 + totalQuestions) → hamesha positive
 * 5. beaten/rank = percentage ke slab ke hisaab se deterministic value
 * 
 * Example: 5 correct out of 20 questions
 * → rawScore = 5×3 - 15×1 = 0 → percentage = 0% → beaten = 50-149 range
 */
export function calculateGuestRanking(
  rawScore: number,
  totalQuestions: number
): RankingResult {
  // 🛡️ STEP 1: Score ko zero se neeche jaane mat do bhai!
  // Negative marking se score minus me ja sakta hai, but user ko
  // "-40 students beaten" dikhana matlb comedy show ban jaayega 😂
  const score = Math.max(0, rawScore);

  // 🛡️ STEP 2: Max marks calculate karo (har question = 3 marks)
  // Agar totalQuestions zero hai (edge case) toh 1 rakho — divide by zero se bachao
  const maxScore = (totalQuestions || 1) * 3;

  // 🛡️ STEP 3: Percentage nikalo, 0-100 ke beech clamp karo
  // Math.min(100, ...) → kabhi 100% se zyada nahi
  // Math.max(0, ...) → kabhi 0% se kam nahi
  const percentage = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
  
  // 🛡️ STEP 4: Seed HAMESHA positive rakhna hai bhai!
  // Pehle bug tha: negative score × 100 = negative seed
  // negative seed % 101 = negative number → beaten bhi negative → UI pe "beat -40" 💀
  // Ab Math.abs lagake pakka positive bana diya
  const seed = Math.abs(score * 100 + totalQuestions);
  
  let beaten = 0;
  let rank = 0;
  
  // 🏆 Ranking slabs — jitna zyada percentage, utne zyada students beaten
  if (percentage >= 80) {
    // 🔥 TOPPER ZONE: 250-350 students haraaye
    beaten = 250 + (seed % 101);
    rank = 1 + (seed % 40);
  } else if (percentage >= 50) {
    // 💪 ACCHA PERFORMANCE: 150-249 students haraaye
    beaten = 150 + (seed % 100);
    rank = 50 + (seed % 200);
  } else if (percentage >= 20) {
    // 📚 THODA AUR PADHNA PADEGA: 50-149 students haraaye
    beaten = 50 + (seed % 100);
    rank = 250 + (seed % 200);
  } else {
    // 🎯 ABHI SHURUAT HAI: 10-49 students haraaye
    // Ye naya slab hai — pehle percentage 0 ya negative hone pe bhi
    // 50+ students beaten dikha raha tha jo galat tha
    beaten = 10 + (seed % 40);
    rank = 400 + (seed % 100);
  }
  
  return { beaten, percentage, rank };
}
