// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function proxy(request: NextRequest) {
//   const host = request.headers.get('host');
  
//   // Check for mppsc subdomain
//   if (host?.includes('mppsc.zenscroll.app')) {
//      const url = request.nextUrl.clone();
     
//      // Redirect root to syllabus
//      if (url.pathname === '/') {
//          url.pathname = '/syllabus';
//          // We redirect to the main domain to consolidate traffic or keep sticky
//          // But user asked to just redirect to the endpoint.
//          // Let's keep it on the same domain if possible, or redirect to main if that's the goal.
//          // "redirect ho jaaye syllabus endpoint par" implies the content should be syllabus.
//          return NextResponse.redirect(url);
//      }
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('mppsc_token')?.value
  const { pathname } = request.nextUrl

  // If user is logged in and tries to access login or signup, redirect to syllabus
  if (token && (pathname === '/login')) {
    return NextResponse.redirect(new URL('/syllabus', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup'],
}
