import { MetadataRoute } from 'next';
import { db } from '@/db';
import { tests, contentBlogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 🗺️ DYNAMIC SITEMAP GENERATOR
 * 
 * Sitemap kya hai?
 * - Website ka complete naksha (map)
 * - Search engines ko batata hai: "Mere pass ye ye pages hain"
 * - Google/Bing automatically discover karte hain
 * 
 * Kyun zaroori hai?
 * - Fast indexing = Better SEO
 * - New pages automatically Google ko pata chal jayenge
 * - Ranking improve hoti hai
 * 
 * Next.js 16 Magic:
 * - Ye file automatically /sitemap.xml pe serve hoti hai
 * - Dynamic generation (database se latest data)
 * - No manual maintenance needed!
 * 
 * Testing:
 * - Dev: http://localhost:3000/sitemap.xml
 * - Prod: https://mppsc.vercel.app/sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mppsc.vercel.app';
  
  /**
   * 📌 STEP 1: STATIC PAGES
   * Ye pages hamesha rahenge (manually define karo)
   */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl, // Home page
      lastModified: new Date(),
      changeFrequency: 'daily', // Daily updates (testimonials, quotes, etc.)
      priority: 1.0, // Sabse important (Home = highest priority)
    },
    {
      url: `${baseUrl}/syllabus`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Weekly syllabus updates
      priority: 0.9, // Main landing page = very important
    },
    {
      url: `${baseUrl}/tests`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // New blogs weekly
      priority: 0.8,
    },
    {
      url: `${baseUrl}/upgrade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  
  try {
    /**
     * 📌 STEP 2: DYNAMIC TEST PAGES
     * Database se saare tests fetch karo aur URLs banao
     */
    const allTests = await db.select({
      slug: tests.slug,
      updatedAt: tests.updatedAt,
      type: tests.type, // FLT, UNIT, CSAT, PYQ
    }).from(tests);
    
    const testPages: MetadataRoute.Sitemap = allTests.map((test) => ({
      url: `${baseUrl}/tests/${test.slug}`,
      lastModified: test.updatedAt || new Date(),
      changeFrequency: 'monthly' as const, // Tests rarely change
      priority: test.type === 'FLT' ? 0.8 : 0.7, // FLT = Higher priority
    }));
    
    /**
     * 📌 STEP 3: DYNAMIC BLOG PAGES
     * Sirf published blogs ko include karo (drafts nahi!)
     */
    const allBlogs = await db.select({
      slug: contentBlogs.slug,
      updatedAt: contentBlogs.updatedAt,
    })
    .from(contentBlogs)
    .where(eq(contentBlogs.isPublished, true)); // Only published
    
    const blogPages: MetadataRoute.Sitemap = allBlogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt || new Date(),
      changeFrequency: 'weekly' as const, // Blogs update weekly
      priority: 0.6,
    }));
    
    /**
     * 📌 STEP 4: SYLLABUS UNIT PAGES
     * 17 units (unit_1 to unit_17)
     */
    const syllabusPages: MetadataRoute.Sitemap = Array.from({ length: 17 }, (_, i) => ({
      url: `${baseUrl}/syllabus/unit_${i + 1}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85, // Core content = High priority
    }));
    
    /**
     * 📌 STEP 5: QUIZ CATEGORY PAGES
     */
    const quizPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/syllabus/quiz/full-length`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/syllabus/quiz/pyq`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/syllabus/quiz/csat`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/syllabus/quiz/units`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/syllabus/analytics`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
    ];
    
    /**
     * 📌 STEP 6: COMBINE ALL PAGES
     * Sab pages ko ek saath merge karo
     */
    const allPages = [
      ...staticPages,      // 8 pages
      ...testPages,        // 50+ pages (database se)
      ...blogPages,        // 10+ pages (database se)
      ...syllabusPages,    // 17 pages
      ...quizPages,        // 5 pages
    ];
    
    console.log(`✅ Sitemap generated successfully: ${allPages.length} URLs`);
    
    return allPages;
    
  } catch (error) {
    /**
     * ⚠️ ERROR HANDLING
     * Agar database fail ho (deployment time pe) to at least static pages return karo
     */
    console.error('❌ Sitemap generation failed:', error);
    console.log('⚠️ Falling back to static pages only');
    return staticPages;
  }
}

/**
 * 📚 COMPLETE TESTING GUIDE
 * 
 * 🎯 1. LOCAL TESTING:
 *    ```bash
 *    npm run dev
 *    # Visit: http://localhost:3000/sitemap.xml
 *    ```
 *    Expected: XML with all URLs
 * 
 * 🎯 2. PRODUCTION TESTING:
 *    ```bash
 *    # Visit: https://mppsc.vercel.app/sitemap.xml
 *    curl https://mppsc.vercel.app/sitemap.xml
 *    ```
 *    Expected: Public accessible, no auth needed
 * 
 * 🎯 3. VALIDATE SYNTAX:
 *    Tool: https://www.xml-sitemaps.com/validate-xml-sitemap.html
 *    - Paste sitemap URL
 *    - Check errors
 * 
 * 🎯 4. GOOGLE SEARCH CONSOLE:
 *    - https://search.google.com/search-console
 *    - Add property: https://mppsc.vercel.app
 *    - Sitemaps → Add sitemap → sitemap.xml
 *    - Submit and monitor
 */
