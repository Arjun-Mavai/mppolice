
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { verifyToken } from '@/lib/jwt'; // Edge runtime issue likely with jsonwebtoken, so we might need simple check or jose. 
// For now, checking presence of token. detailed verification in server components/actions.

export function proxy(request: NextRequest) {
  const token = request.cookies.get('mppsc_token')?.value
  const { pathname } = request.nextUrl

  // "Bhai, agar token nahi hai aur admin mein ghus raha hai, toh bhaga do"
  if (pathname.startsWith('/admin')) {
      if (!token) {
           // "Chal bhai, login page pe ja"
           return NextResponse.redirect(new URL('/login', request.url))
      }
      // Note: Full verification should happen on server side or using Edge-compatible library like 'jose' here
      // if we want strict security at edge.  For now, trusting token presence + server side verification.
  }

  // If user is logged in and tries to access login, redirect to syllabus
  if (token && (pathname === '/login' )) {
    return NextResponse.redirect(new URL('/syllabus', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
}
