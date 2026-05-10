import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  const res = new Response()
  const session = await getIronSession<SessionData>(request, res, sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
