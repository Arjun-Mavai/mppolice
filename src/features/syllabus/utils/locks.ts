
import { TopicData } from "@/app/syllabus/[unitId]/UnitContent";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  ACCESS CONTROL ka REMOTE CONTROL - Yaha se sab control hota h ║
// ║  Bhai ye ek jagah se decide hota h ki kaun kitna dekh sakta h   ║
// ╚══════════════════════════════════════════════════════════════════╝

/**
 * 🎮 ACCESS CONTROL CONFIG - Ye h tera remote control bhai
 * 
 * FREE USERS (no login):
 *   - Unit 1: Pehle FREE_TOPICS_UNIT1 (5) topics khule h
 *   - Baaki units: Sab LOCKED 🔒
 * 
 * LITE USERS (lite plan):
 *   - Sab units accessible, par limited topics per unit
 *   - Kitne? getLiteUnlockLimit() decide karta h
 *   - 10+ topics wali unit → 5 khule
 *   - 5-10 topics → 3 khule  
 *   - 5 se kam → 1 khula
 * 
 * PRO USERS (pro plan):
 *   - SAB KUCH KHULA 🔓 - Full VIP treatment
 * 
 * topic.isFree flag:
 *   - DB me kisi topic ko manually free mark kar sakte h
 *   - Ye flag sab tiers ke liye override karta h (always unlocked)
 *   - Admin page se control kar sakte h future me
 */
export const ACCESS_CONFIG = {
    // Unit 1 me kitne topics free users ko dikhane h
    FREE_TOPICS_UNIT1: 5,
    
    // Lite plan limits (unit ke total topics ke basis par)
    LITE_LIMITS: {
        LARGE_UNIT: 5,    // 10+ topics wali unit me 5 free
        MEDIUM_UNIT: 3,   // 5-10 topics wali unit me 3 free
        SMALL_UNIT: 1,    // 5 se kam topics me 1 free
    },
    
    // Threshold - kitne topics par large/medium decide hota h
    LARGE_UNIT_THRESHOLD: 10,
    SMALL_UNIT_THRESHOLD: 5,
} as const;

/**
 * Lite user ko kitne topics unlock karne h - unit size ke basis par
 * Bhai jaise unit bada, lite user ko thoda zyada milta h
 */
export function getLiteUnlockLimit(totalTopics: number): number {
    // >= so a unit with exactly 10 topics gets LARGE_UNIT limit (5 free)
    if (totalTopics >= ACCESS_CONFIG.LARGE_UNIT_THRESHOLD) return ACCESS_CONFIG.LITE_LIMITS.LARGE_UNIT;
    if (totalTopics < ACCESS_CONFIG.SMALL_UNIT_THRESHOLD) return ACCESS_CONFIG.LITE_LIMITS.SMALL_UNIT;
    
    // Covers 5, 6, 7, 8, 9
    return ACCESS_CONFIG.LITE_LIMITS.MEDIUM_UNIT; 
}

interface UserState {
    isSubscribed: boolean;
    plan_tier?: 'free' | 'lite' | 'pro' | null;
}

/**
 * 🔐 Ye function decide karta h ki topic locked h ya nahi
 * 
 * Logic ka flow (top se bottom check hota h):
 * 1. topic.isFree = true → ALWAYS UNLOCKED (DB override)
 * 2. Unit 1 + free user → pehle 5 topics free
 * 3. Non-subscribed user → LOCKED
 * 4. Pro user → SAB KHULA
 * 5. Lite user → getLiteUnlockLimit() ke basis par
 */
export function isSyllabusTopicLocked(
    topic: TopicData, 
    index: number, 
    user: UserState | null,
    unitId: string,
    totalTopics: number
): boolean {
    // Step 1: DB me free mark h to seedha unlock - no questions asked
    if (topic.isFree) return false;
    
    // Step 2: Unit 1 ka special treatment - pehle 5 topics sabke liye free
    if (unitId === 'unit_1') {
        if (!user || !user.isSubscribed) {
            return index >= ACCESS_CONFIG.FREE_TOPICS_UNIT1;
        }
    }

    // Step 3: Subscribe nahi kiya? Baaki sab lock bhai
    if (!user || !user.isSubscribed) return true;

    // Step 4: PRO user h to sab khula - VIP treatment
    const planTier = user.plan_tier || 'lite';
    if (planTier === 'pro') return false;

    // Step 5: LITE user - limited access milega
    if (planTier === 'lite') {
        const limit = getLiteUnlockLimit(totalTopics);
        return index >= limit;
    }

    return true; // Safety net - unknown tier to lock hi rakh
}
