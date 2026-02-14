export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mppsc.zenscroll.app";
    
    // 🤖 CUSTOM ROBOTS.TXT
    // We are using a Route Handler because Next.js's default robots.ts 
    // doesn't support the non-standard 'Content-Signal' field.
    
    const content = [
        "User-agent: *",
        "Content-Signal: search=yes,ai-train=no",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /admin/",
        "Disallow: /app/",
        "Disallow: /dashboard/",
        "Disallow: /syllabus/analytics/",
        "Disallow: /syllabus/quiz/play",
        "Disallow: /_next/static/css/",
        "Disallow: /_next/static/media/",
        "Disallow: /signup",
        "Disallow: /forgot-password",
        "",
        "User-agent: Googlebot",
        "Allow: /",
        "Allow: /syllabus/",
        "Allow: /blogs/",
        "Allow: /syllabus/quiz/pyq",
        "Allow: /tests/",
        "Disallow: /api/",
        "Disallow: /admin/",
        "Disallow: /app/",
        "Disallow: /dashboard/",
        "Disallow: /syllabus/analytics/",
        "Disallow: /syllabus/quiz/play",
        "",
        "User-agent: Bingbot",
        "Allow: /",
        "Allow: /syllabus/",
        "Allow: /blogs/",
        "Allow: /tests/",
        "Disallow: /api/",
        "Disallow: /admin/",
        "Disallow: /app/",
        "Disallow: /dashboard/",
        "Disallow: /syllabus/quiz/play",
        "",
        "User-agent: AhrefsBot",
        "User-agent: SemrushBot",
        "User-agent: DotBot",
        "User-agent: MJ12bot",
        "User-agent: BLEXBot",
        "User-agent: PetalBot",
        "Disallow: /",
        "",
        `Sitemap: ${baseUrl}/sitemap.xml`
    ].join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=600',
        },
    });
}
