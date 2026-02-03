
import { TopicData } from "@/app/syllabus/[unitId]/UnitContent";

/**
 * Calculates how many topics should be unlocked for a Lite user 
 * based on the total number of topics in the unit.
 */
export function getLiteUnlockLimit(totalTopics: number): number {
    if (totalTopics > 10) return 5;
    if (totalTopics < 5) return 1;
    // Covers 5, 6, 7, 8, 9, 10
    return 3; 
}

interface UserState {
    isSubscribed: boolean;
    plan_tier?: 'free' | 'lite' | 'pro' | null;
}

/**
 * Centralized logic to check if a syllabus topic is locked.
 */
export function isSyllabusTopicLocked(
    topic: TopicData, 
    index: number, 
    user: UserState | null,
    unitId: string,
    totalTopics: number
): boolean {
    // 1. If topic is explicitly free, it's unlocked
    if (topic.isFree) return false;
    
    // 2. Unit 1 is completely free (Trial)
    if (unitId === 'unit_1') return false;

    // 3. User not subscribed -> Locked
    if (!user || !user.isSubscribed) return true;

    // 4. Subscribed Logic based on Tier
    const planTier = user.plan_tier || 'lite'; // Default to lite if missing logic

    if (planTier === 'pro') return false; // PRO = All Unlocked

    if (planTier === 'lite') {
        const limit = getLiteUnlockLimit(totalTopics);
        // Index is 0-based. If limit is 3, indices 0, 1, 2 are unlocked.
        if (index < limit) return false;
        return true;
    }

    return true; // Fallback
}
