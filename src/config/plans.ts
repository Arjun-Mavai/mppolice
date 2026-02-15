export const PLAN_LIMITS = {
  free: {
    blog_limit: 4,
    topic_tests_limit: 0, // Very limited or none? User said "blogs me bhi lock kar do... free users ko only 4". For quizzes, probably locked or very basic. Assuming minimal.
    unit_tests_limit: 0,
    flt_limit: 0,
    pyq_limit: 0,
    tier_name: 'Free',
  },
  lite: {
    blog_limit: 1000, // Effectively unlimited for paying users as per user request
    topic_tests_limit: 5, // 5 per topic
    unit_tests_limit: 5, // 5 total across units (as per request "units tests me 5 milenge")
    flt_limit: 2,
    pyq_limit: 2,
    tier_name: 'Lite',
  },
  pro: {
    blog_limit: 10000,
    topic_tests_limit: 10000,
    unit_tests_limit: 10000,
    flt_limit: 10000,
    pyq_limit: 10000,
    tier_name: 'Pro',
  },
  guest: {
    blog_limit: 4,
    topic_tests_limit: 1, // 1 per unit
    unit_tests_limit: 2, // First 2 units
    flt_limit: 0,
    pyq_limit: 0,
    tier_name: 'Guest',
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export const PLANS = {
  LITE: 'lite',
  PRO: 'pro',
} as const;
