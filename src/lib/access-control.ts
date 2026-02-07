// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ ACCESS CONTROL SYSTEM (Gatekeeper/Watchman)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Bhai, yeh file hai poore app ka WATCHMAN! 🔐
// Kaun kya dekh sakta hai, kaun kya kar sakta hai, sab yahi decide hota hai.
//
// ✨ Features:
// - User tier detection (Guest/Free/Lite/Pro)
// - Topic access control (Locked/Unlocked)
// - Test access control (Premium tests)
// - Attempt limits (Kitni baar test de sakta hai)
// - Upgrade prompts (Paisa mangte waqt)
//
// 🎯 Philosophy:
// 1. Admin = Baap hai system ka (Sab open)
// 2. Pro = Paisa diya hai (Full access)
// 3. Lite = Budget plan (Limited access)
// 4. Free/Guest = Sample dekh sakte ho (Unit 1 only)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { mppscUsers, tests, syllabusTopics } from '@/db/schema';
import { PLAN_LIMITS, type PlanType } from '@/config/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User Type
 * ─────────────────────────────────────────────────────────────────────
 * Database schema se match karta hai.
 * Null ho sakta hai (guest user ke case mein)
 */
export type User = typeof mppscUsers.$inferSelect | null;

/**
 * Test Type
 * ─────────────────────────────────────────────────────────────────────
 * Test ka complete object structure
 */
export type Test = typeof tests.$inferSelect;

/**
 * Topic Type
 * ─────────────────────────────────────────────────────────────────────
 * Syllabus topic ka structure
 */
export type Topic = typeof syllabusTopics.$inferSelect;

/**
 * Plan Tiers
 * ─────────────────────────────────────────────────────────────────────
 * Sirf yeh 3 plans allowed hain:
 * - free: Kuch nahi diya (Unit 1 only)
 * - lite: Budget plan (Limited access)
 * - pro: Full plan (Everything unlocked)
 */
export type PlanTier = 'free' | 'lite' | 'pro';

/**
 * Access Result
 * ─────────────────────────────────────────────────────────────────────
 * Jab bhi access check karo, yeh structure milega
 */
export interface AccessResult {
    allowed: boolean;           // Access hai ya nahi?
    reason?: string;            // Kyu nahi hai access?
    requiresUpgrade?: boolean;  // Upgrade chahiye?
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 TIER DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * getUserTier
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, user ki actual aukat (tier) batata hai.
 * 
 * Logic Flow:
 * 1. User nahi hai? → 'guest'
 * 2. Admin hai? → 'pro' (full access)
 * 3. Subscribed hai? → uska plan check karo
 * 4. Warna → 'free'
 * 
 * Edge Case Handled:
 * - DB me kabhi plan='free' par isSubscribed=true (legacy bug)
 * - Aise cases me 'lite' return karte hain (safe side)
 * 
 * @param user - User object (can be null for guests)
 * @returns 'guest' | 'free' | 'lite' | 'pro'
 * 
 * @example
 * const tier = getUserTier(user);
 * if (tier === 'pro') {
 *   // Show everything
 * }
 */
export function getUserTier(user: User): PlanTier | 'guest' {
    // ───────────────────────────────────────────────────────────────
    // CASE 1: No user (Guest)
    // ───────────────────────────────────────────────────────────────
    if (!user) return 'guest';

    // ───────────────────────────────────────────────────────────────
    // CASE 2: Admin (Boss Mode!)
    // ───────────────────────────────────────────────────────────────
    // Admin ko seedha pro maan lo, sab open hai unke liye
    if (user.role === 'admin') return 'pro';

    // ───────────────────────────────────────────────────────────────
    // CASE 3: Subscribed User
    // ───────────────────────────────────────────────────────────────
    if (user.isSubscribed) {
        // Legacy bug fix: Agar plan 'free' hai par subscribed hai
        // (DB inconsistency), to 'lite' maan lo
        if (user.planTier === 'free') return 'lite';
        
        // Normal case: Jo plan DB me hai wahi return karo
        return (user.planTier as PlanTier) || 'lite';
    }

    // ───────────────────────────────────────────────────────────────
    // CASE 4: Non-Subscribed User (Free Plan)
    // ───────────────────────────────────────────────────────────────
    return 'free';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔓 TOPIC ACCESS CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAccessTopic
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, topic khulega ya nahi?
 * 
 * Free Users Ko Kya Milta Hai?
 * - Unit 1 ke pehle 10 topics (Sample ke liye)
 * - Koi bhi 'isFree' marked topic
 * 
 * Paid Users Ko Kya Milta Hai?
 * - Sab kuch! (All units, all topics)
 * 
 * Priority Order:
 * 1. Admin? → YES (sab open)
 * 2. Topic free hai? → YES (prasad samajh ke)
 * 3. Unit 1 pehle 10? → YES (sample)
 * 4. Subscribed? → YES (paisa diya hai)
 * 5. Baaki → NO (locked)
 * 
 * @param topic - Topic object to check
 * @param user - Current user (can be null)
 * @returns true if user can access, false if locked
 * 
 * @example
 * if (canAccessTopic(topic, user)) {
 *   <TopicContent />
 * } else {
 *   <LockedBadge />
 * }
 */
export function canAccessTopic(topic: Topic, user: User): boolean {
    // ───────────────────────────────────────────────────────────────
    // CHECK 1: Admin Access
    // ───────────────────────────────────────────────────────────────
    if (user?.role === 'admin') return true;
    
    // ───────────────────────────────────────────────────────────────
    // CHECK 2: Free Topic (Marked by admin)
    // ───────────────────────────────────────────────────────────────
    if (topic.isFree) return true;
    
    // ───────────────────────────────────────────────────────────────
    // CHECK 3: Unit 1 Sample Topics (1-10)
    // ───────────────────────────────────────────────────────────────
    // Prasad samajh ke dete hain, sabko taste milna chahiye!
    if (topic.unitId === 'unit_1' && topic.order <= 10) return true;
    
    // ───────────────────────────────────────────────────────────────
    // CHECK 4: Subscription Status
    // ───────────────────────────────────────────────────────────────
    if (user?.isSubscribed) return true;
    
    // ───────────────────────────────────────────────────────────────
    // DEFAULT: Locked!
    // ───────────────────────────────────────────────────────────────
    return false;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 TEST ACCESS CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAccessTest
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, test de payega ya nahi?
 * 
 * Test Types:
 * 1. Premium Tests (isPro = true) → Subscription chahiye
 * 2. Regular Tests → Logged in user ko mil jayega
 * 
 * Access Rules:
 * - Admin → Sab access
 * - Pro User → Sab tests (Premium bhi)
 * - Lite User → Sab tests (but attempt limits alag check honge)
 * - Free User → Only non-premium tests
 * - Guest → No access
 * 
 * @param test - Test object to check
 * @param user - Current user (can be null)
 * @returns true if user can see test, false if hidden
 * 
 * @example
 * if (canAccessTest(test, user)) {
 *   <TestCard />
 * } else {
 *   <PremiumBadge />
 * }
 */
export function canAccessTest(test: Test, user: User): boolean {
    // ───────────────────────────────────────────────────────────────
    // CHECK 1: Admin Access (Unlimited)
    // ───────────────────────────────────────────────────────────────
    if (user?.role === 'admin') return true;
    
    // ───────────────────────────────────────────────────────────────
    // CHECK 2: Regular Test (Non-Premium)
    // ───────────────────────────────────────────────────────────────
    // Agar test premium nahi hai, koi bhi logged in user de sakta
    if (!test.isPro && user) return true;
    
    // ───────────────────────────────────────────────────────────────
    // CHECK 3: Premium Test (isPro = true)
    // ───────────────────────────────────────────────────────────────
    // Premium test ke liye subscription mandatory hai
    if (test.isPro && !user?.isSubscribed) return false;
    
    // ───────────────────────────────────────────────────────────────
    // CHECK 4: Subscribed User Access
    // ───────────────────────────────────────────────────────────────
    if (user?.isSubscribed) {
        const tier = getUserTier(user);
        
        // Pro users → Full access (no questions asked!)
        if (tier === 'pro') return true;
        
        // Lite users → Can ACCESS tests (attempts limited separately)
        // Note: Access control alag hai, attempt limits alag
        // Lite users ko test dikhai dega, but kitni baar de sakte wo
        // canAttemptTest() se check hoga
        if (tier === 'lite') return true;
    }
    
    // ───────────────────────────────────────────────────────────────
    // DEFAULT: Check subscription status
    // ───────────────────────────────────────────────────────────────
    return user?.isSubscribed || false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 ATTEMPT LIMIT CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAttemptTest
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, test shuru karne de ya rok de?
 * 
 * This is DIFFERENT from canAccessTest:
 * - canAccessTest → Test dikhai dega ya nahi
 * - canAttemptTest → Test de payega ya limit exceed
 * 
 * Attempt Limits (from PLAN_LIMITS config):
 * - Free Plan → 1 attempt per test
 * - Lite Plan → 3 attempts (topic), 5 attempts (unit/FLT)
 * - Pro Plan → Unlimited (∞)
 * 
 * Flow:
 * 1. Basic checks (admin, login, access)
 * 2. Get user tier
 * 3. Check attempt limits based on tier
 * 4. Return detailed result with reason
 * 
 * @param test - Test object
 * @param user - Current user
 * @param currentAttempts - Kitni baar already attempt kar chuka
 * @returns AccessResult with allowed/reason/upgrade flag
 * 
 * @example
 * const result = canAttemptTest(test, user, 2);
 * if (!result.allowed) {
 *   if (result.requiresUpgrade) {
 *     <UpgradePrompt reason={result.reason} />
 *   } else {
 *     <LoginPrompt />
 *   }
 * }
 */
export function canAttemptTest(
    test: Test,
    user: User,
    currentAttempts: number
): AccessResult {
    
    // ───────────────────────────────────────────────────────────────
    // STEP 1: Admin Check (Bypass all limits)
    // ───────────────────────────────────────────────────────────────
    if (user?.role === 'admin') return { allowed: true };
    
    // ───────────────────────────────────────────────────────────────
    // STEP 2: Login Check
    // ───────────────────────────────────────────────────────────────
    if (!user) {
        return {
            allowed: false,
            reason: 'Test dene ke liye Login jaruri hai bhai.',
            requiresUpgrade: false
        };
    }
    
    // ───────────────────────────────────────────────────────────────
    // STEP 3: Access Check (Can user even see this test?)
    // ───────────────────────────────────────────────────────────────
    if (!canAccessTest(test, user)) {
        return {
            allowed: false,
            reason: 'Ye Premium Test hai. Access ke liye upgrade karo.',
            requiresUpgrade: true
        };
    }
    
    // ───────────────────────────────────────────────────────────────
    // STEP 4: Get User Tier & Limits
    // ───────────────────────────────────────────────────────────────
    const tier = getUserTier(user);
    
    // Guest shouldn't reach here (caught by step 2), but safety check
    if (tier === 'guest') {
        return {
            allowed: false,
            reason: 'Login required',
            requiresUpgrade: false
        };
    }

    // Get limits from config based on tier
    const limits = PLAN_LIMITS[tier];
    
    // ───────────────────────────────────────────────────────────────
    // STEP 5: Apply Tier-Specific Limits
    // ───────────────────────────────────────────────────────────────
    
    if (tier === 'free') {
        // ┌──────────────────────────────────────────────────────┐
        // │ FREE PLAN: Bahut strict quota                       │
        // │ - 1 attempt per test (total)                        │
        // │ - Upgrade prompt required                           │
        // └──────────────────────────────────────────────────────┘
        if (currentAttempts >= 1) {
            return {
                allowed: false,
                reason: 'Free plan me ek hi attempt milta hai. Unlimited attempts ke liye upgrade karo!',
                requiresUpgrade: true
            };
        }
        
    } else if (tier === 'lite') {
        // ┌──────────────────────────────────────────────────────┐
        // │ LITE PLAN: Moderate limits                          │
        // │ - Topic Test: 3 attempts                            │
        // │ - Unit/FLT Test: 5 attempts                         │
        // │ - Pro upgrade for unlimited                         │
        // └──────────────────────────────────────────────────────┘
        const limit = test.type === 'UNIT' || test.type === 'FLT'
            ? limits.unit_tests_limit
            : limits.topic_tests_limit;
        
        if (currentAttempts >= limit) {
            return {
                allowed: false,
                reason: `Lite Plan me sirf ${limit} attempts allowed hain. Pro lelo, unlimited hai! 🚀`,
                requiresUpgrade: true
            };
        }
    }
    
    // ───────────────────────────────────────────────────────────────
    // STEP 6: Pro Users & Within Limits
    // ───────────────────────────────────────────────────────────────
    // Pro walo ki nikal padi (Unlimited attempts! 🎉)
    // Ya phir free/lite limits ke andar hai
    return { allowed: true };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💬 USER-FACING MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * getLockReason
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, user ko pyara sa message dikhane ke liye ki kyu lock hai.
 * 
 * Context-aware messages:
 * - Content type pe depend karta hai (topic/test/unit)
 * - User tier pe depend karta hai (free/lite)
 * 
 * @param contentType - What is locked? (topic/test/unit)
 * @param user - Current user
 * @returns Human-friendly lock reason message
 * 
 * @example
 * const message = getLockReason('topic', user);
 * <p>{message}</p>
 */
export function getLockReason(
    contentType: 'topic' | 'test' | 'unit',
    user: User
): string {
    // ───────────────────────────────────────────────────────────────
    // No User (Guest)
    // ───────────────────────────────────────────────────────────────
    if (!user) return 'Access ke liye Login karein';
    
    const tier = getUserTier(user);
    
    // ───────────────────────────────────────────────────────────────
    // Free User Messages
    // ───────────────────────────────────────────────────────────────
    if (tier === 'free') {
        if (contentType === 'topic') {
            return 'Unit 1 ke baad ke topics Premium hain. Upgrade karein!';
        }
        if (contentType === 'test') {
            return 'Premium tests aur unlimited attempts ke liye upgrade karein.';
        }
        if (contentType === 'unit') {
            return 'Unit 2 se 10 tak sab Locked hai. Sirf Pro/Lite members ke liye.';
        }
    }
    
    // ───────────────────────────────────────────────────────────────
    // Lite User Message
    // ───────────────────────────────────────────────────────────────
    if (tier === 'lite') {
        return 'Full access aur unlimited attempts ke liye Pro Plan pe upgrade karein.';
    }
    
    // ───────────────────────────────────────────────────────────────
    // Default Generic Message
    // ───────────────────────────────────────────────────────────────
    return 'Locked Content';
}

/**
 * shouldShowUpgradePrompt
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, kya user ko "Paisa do!" wala popup dikhana chahiye?
 * 
 * Logic:
 * - Admin → NO (Boss se paisa nahi mangte)
 * - Guest → NO (Pehle login to karwao)
 * - Free/Lite → YES (Inko upgrade prompt dikha do)
 * - Pro → NO (Already premium hai)
 * 
 * @param user - Current user
 * @returns true if upgrade prompt should be shown
 * 
 * @example
 * if (shouldShowUpgradePrompt(user)) {
 *   <UpgradeModal />
 * }
 */
export function shouldShowUpgradePrompt(user: User): boolean {
    // ───────────────────────────────────────────────────────────────
    // Don't show to guests (show login instead)
    // ───────────────────────────────────────────────────────────────
    if (!user) return false;
    
    // ───────────────────────────────────────────────────────────────
    // Don't show to admin (they own the system!)
    // ───────────────────────────────────────────────────────────────
    if (user.role === 'admin') return false;
    
    const tier = getUserTier(user);
    
    // ───────────────────────────────────────────────────────────────
    // Show to free and lite users only
    // ───────────────────────────────────────────────────────────────
    return tier === 'free' || tier === 'lite';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎁 BONUS: Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * getUpgradeMessage
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, tier-specific upgrade message.
 * 
 * @param user - Current user
 * @returns Personalized upgrade CTA message
 */
export function getUpgradeMessage(user: User): string {
    const tier = getUserTier(user);
    
    if (tier === 'free') {
        return '🚀 Pro Plan lelo - Sab unlock ho jayega! Full syllabus + Unlimited tests!';
    }
    
    if (tier === 'lite') {
        return '⚡ Pro Plan upgrade karo - Unlimited attempts + Full access!';
    }
    
    return '';
}

/**
 * canAccessUnit
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, unit khulega ya nahi? (Quick check for units)
 * 
 * @param unitId - Unit identifier (e.g., 'unit_1', 'unit_2')
 * @param user - Current user
 * @returns true if unit is accessible
 */
export function canAccessUnit(unitId: string, user: User): boolean {
    // Unit 1 always open (sample)
    if (unitId === 'unit_1') return true;
    
    // Admin access
    if (user?.role === 'admin') return true;
    
    // Subscribed users
    return user?.isSubscribed || false;
}
