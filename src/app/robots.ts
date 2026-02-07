import { MetadataRoute } from 'next';

/**
 * 🤖 ROBOTS.TXT GENERATOR
 * 
 * Robots.txt kya hai?
 * - Search engine bots ko instructions deta hai
 * - Batata hai: Kahan crawl karna OK hai, kahan NAHI
 * - Security + Performance ke liye important
 * 
 * Simple Analogy:
 * - Tumhare ghar ka security guard
 * - Good guests (Google, Bing) = "Aao bhai, andar aao!" ✅
 * - Bad guests (Spam bots, Scrapers) = "Bahar hi ruko!" ❌
 * - Private rooms (Admin panel) = "Ye room off-limits" 🚫
 * 
 * Next.js 16 Magic:
 * - Ye file automatically /robots.txt pe serve hoti hai
 * - Dynamic generation (environment based)
 * - TypeScript type safety! 🎯
 * 
 * Testing:
 * - Dev: http://localhost:3000/robots.txt
 * - Prod: https://mppsc.vercel.app/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mppsc.vercel.app';

  return {
    /**
     * 📜 RULES ARRAY
     * Multiple rules for different bots
     */
    rules: [
      /**
       * ✅ RULE 1: GENERAL BOTS (Sabke liye default)
       * User-agent: * means "All bots"
       */
      {
        userAgent: '*', // Asterisk (*) = All bots
        allow: '/', // Root directory se sab pages accessible
        disallow: [
          '/api/',           // API endpoints (SEO value nahi, crawl waste)
          '/admin/',         // Admin panel (security risk!)
          '/app/profile',    // User profiles (private data)
          '/_next/static/css/', // Next.js internal CSS (no SEO value)
          '/_next/static/media/', // Media files (handled separately)
          '/private/',       // Private routes (agar future me add kare)
        ],
      },
      
      /**
       * ✅ RULE 2: GOOGLEBOT (Special rules for Google)
       * Google = Main traffic source, customize karo!
       */
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/app/profile',
        ],
      },
      
      /**
       * ✅ RULE 3: GOOGLE IMAGE BOT
       * Images SEO ke liye important hain!
       */
      {
        userAgent: 'Googlebot-Image',
        allow: '/', // Saare images accessible
        disallow: ['/admin/'], // Admin images nahi
      },
      
      /**
       * ✅ RULE 4: BING BOT
       * Bing India me popular hai, ignore mat karo!
       */
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      
      /**
       * ❌ RULE 5: BAD BOTS (Block karo completely)
       * Ye bots tumhari site scrape karte hain (competitors ke liye)
       */
      {
        userAgent: [
          'AhrefsBot',      // SEO tool bot (competitor analysis)
          'SemrushBot',     // SEO tool bot
          'DotBot',         // Aggressive scraper
          'MJ12bot',        // Majestic SEO crawler
          'BLEXBot',        // Link explorer
          'PetalBot',       // Chinese search bot (optional block)
        ],
        disallow: '/',      // Full site block for these bots
      },
    ],
    
    /**
     * 🗺️ SITEMAP LOCATION
     * Bots ko seedha sitemap ka link de do
     * Automatic discovery ke liye
     */
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

/**
 * 📚 COMPLETE TESTING GUIDE
 * 
 * 🎯 1. LOCAL TESTING:
 *    ```bash
 *    npm run dev
 *    curl http://localhost:3000/robots.txt
 *    # OR browser: http://localhost:3000/robots.txt
 *    ```
 * 
 * 🎯 2. PRODUCTION TESTING:
 *    ```bash
 *    curl https://mppsc.vercel.app/robots.txt
 *    # Browser: https://mppsc.vercel.app/robots.txt
 *    ```
 * 
 * 🎯 3. GOOGLE ROBOTS TESTER:
 *    - Google Search Console → robots.txt Tester
 *    - Test: /syllabus → Should be ALLOWED ✅
 *    - Test: /admin → Should be BLOCKED ❌
 * 
 * 🎯 4. VALIDATE SYNTAX:
 *    Tool: https://en.ryte.com/free-tools/robots-txt/
 *    - Paste robots.txt content
 *    - Check for errors
 * 
 * ⚠️ COMMON MISTAKES:
 * 
 * 1. ❌ Blocking whole site:
 *    User-agent: *, Disallow: / ← DANGER!
 * 
 * 2. ❌ Typos in paths:
 *    Disallow: /admn/ ← Won't block /admin/
 * 
 * 3. ❌ Forgetting sitemap:
 *    No sitemap = Slow indexing
 * 
 * 4. ❌ Security through robots.txt:
 *    robots.txt is PUBLIC! Use proper auth for sensitive routes
 */
