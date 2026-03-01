import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Supabase session cookie - no network call needed
  const hasSession = request.cookies.getAll().some(
    cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  )

  const publicPaths = ['/', '/login', '/signup', '/auth/callback']
  const isPublicPath = publicPaths.some(path => pathname === path)
  const isApiRoute = pathname.startsWith('/api/')

  if (!hasSession && !isPublicPath && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (hasSession && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
