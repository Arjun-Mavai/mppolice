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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mppsc.zenscroll.app";

  return {
    rules: [
      // Default rules - sabke liye
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',              // API endpoints - crawl waste
          '/admin/',            // Admin panel - security
          '/app/',              // User app pages - private
          '/dashboard/',        // User dashboard - private
          '/syllabus/analytics/',  // User analytics - private
          '/syllabus/quiz/play/',  // Quiz play - dynamic, private
          '/tests/',            // Old test routes - behind auth
          '/_next/static/css/',
          '/_next/static/media/',
          '/signup',            // Redirected page
          '/forgot-password',   // Auth flow - no SEO value
        ],
      },
      // Googlebot - main traffic source
      {
        userAgent: 'Googlebot',
        allow: ['/', '/syllabus/', '/blogs/', '/syllabus/quiz/'],
        disallow: ['/api/', '/admin/', '/app/', '/dashboard/', '/syllabus/analytics/', '/syllabus/quiz/play/', '/tests/'],
      },
      // Bing - India me bhi use hota h
      {
        userAgent: 'Bingbot',
        allow: ['/', '/syllabus/', '/blogs/'],
        disallow: ['/api/', '/admin/', '/app/', '/dashboard/', '/syllabus/quiz/play/', '/tests/'],
      },
      // Bad bots - scraper block
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot', 'BLEXBot', 'PetalBot'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
