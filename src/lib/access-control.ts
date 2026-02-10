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
 * canAccessTopic — DB FLAGS based access control
 * ─────────────────────────────────────────────────────────────────────
 * Ab sab kuch DB flags se decide hota hai — admin panel se toggle karo
 * 
 * DB Flags:
 * - isFree = true → FREE/GUEST bhi dekh sakte
 * - isLiteAccess = true → LITE user dekh sakta
 * - isProAccess = true → PRO user dekh sakta (default sab true)
 * 
 * Priority:
 * 1. Admin? → YES (boss hai)
 * 2. isFree = true → YES (sabke liye khula)
 * 3. Pro + isProAccess → YES
 * 4. Lite + (isLiteAccess OR isFree) → YES
 * 5. Free/Guest → sirf isFree wale
 * 6. Default → LOCKED 🔒
 */
export function canAccessTopic(topic: Topic, user: User): boolean {
    // ── Admin → bypass sab ──────────────────────────────────────
    if (user?.role === 'admin') return true;
    
    // ── Free topic → sabke liye open ────────────────────────────
    if (topic.isFree) return true;
    
    // ── User ka tier nikalo ─────────────────────────────────────
    const tier = getUserTier(user);
    
    // ── Pro user — isProAccess check (default true if null) ─────
    if (tier === 'pro') {
        return topic.isProAccess !== false;
    }
    
    // ── Lite user — isLiteAccess check ──────────────────────────
    if (tier === 'lite') {
        return topic.isLiteAccess === true;
    }
    
    // ── Free/Guest — sirf isFree wale (already checked above) ───
    return false;
}

/**
 * canAccessBlog — DB FLAGS based blog access control
 * ─────────────────────────────────────────────────────────────────────
 * Same pattern as topics/tests — admin panel se toggle karo
 * 
 * DB Flags on contentBlogs:
 * - isFreeAccess = true → FREE user bhi padh sakta
 * - isLiteAccess = true → LITE user padh sakta
 * - isProAccess = true → PRO user padh sakta (default true)
 * - isPremium = legacy flag (backward compat — NOT used in logic anymore)
 */
export function canAccessBlog(blog: { isFreeAccess: boolean | null; isLiteAccess: boolean | null; isProAccess: boolean | null; isPremium: boolean | null }, user: User): boolean {
    // ── Admin → sab khula ───────────────────────────────────────
    if (user?.role === 'admin') return true;
    
    // ── User ka tier nikalo ─────────────────────────────────────
    const tier = getUserTier(user);
    
    // ── Pro user — isProAccess check ────────────────────────────
    if (tier === 'pro') {
        return blog.isProAccess !== false;
    }
    
    // ── Lite user — isLiteAccess OR isFreeAccess ────────────────
    if (tier === 'lite') {
        return blog.isLiteAccess === true || blog.isFreeAccess === true;
    }
    
    // ── Free/Guest — sirf isFreeAccess wale ─────────────────────
    return blog.isFreeAccess === true;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 TEST ACCESS CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAccessTest
 * ─────────────────────────────────────────────────────────────────────
 * Bhai, test de payega ya nahi? — DB FLAGS se decide hota hai ab!
 * 
 * Pehle kaise tha (OLD — Index-Based):
 *   tests.map((test, index) => isLocked = index >= limit)
 *   Problem: Naye test add kiye to order change, access bhi change 😱
 * 
 * Ab kaise hai (NEW — DB Flag-Based):
 *   Har test pe 3 boolean flags hain DB me:
 *   - isFreeAccess → Free/Guest users ke liye khula
 *   - isLiteAccess → Lite plan users ke liye khula
 *   - isProAccess  → Pro plan users ke liye khula (default true)
 * 
 *   Admin panel se toggle karo → turant reflect hoga frontend pe
 *   No code change needed, no redeployment! 🎯
 * 
 * Access Check Priority:
 *   1. Admin? → YES (Boss mode — sab open)
 *   2. Pro user? → isProAccess flag check
 *   3. Lite user? → isLiteAccess ya isFreeAccess (dono me se ek true ho)
 *   4. Free/Guest? → sirf isFreeAccess flag
 * 
 * @param test - Test object (DB se aaya, flags included)
 * @param user - Current user (null = guest)
 * @returns true = test accessible, false = locked 🔒
 */
export function canAccessTest(test: Test, user: User): boolean {
    // ───────────────────────────────────────────────────────────────
    // CHECK 1: Admin = Baap hai, sab khula
    // ───────────────────────────────────────────────────────────────
    if (user?.role === 'admin') return true;

    // ───────────────────────────────────────────────────────────────
    // CHECK 2: User ki tier nikalo
    // ───────────────────────────────────────────────────────────────
    const tier = getUserTier(user);

    // ───────────────────────────────────────────────────────────────
    // CHECK 3: DB flags se access decide karo
    // Pro → isProAccess check (almost always true)
    // Lite → isLiteAccess OR isFreeAccess (koi bhi true ho to OK)
    // Free/Guest → sirf isFreeAccess (agar admin ne free mark kiya)
    // ───────────────────────────────────────────────────────────────
    switch (tier) {
        case 'pro':
            return test.isProAccess ?? true;
        case 'lite':
            return (test.isLiteAccess ?? false) || (test.isFreeAccess ?? false);
        case 'free':
        case 'guest':
        default:
            return test.isFreeAccess ?? false;
    }
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
