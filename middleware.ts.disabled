import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from './lib/authConfig'

function parseAuth(request: NextRequest) {
  const cookie = request.cookies.get('bowpaw-auth')
  if (!cookie?.value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie.value))
    if (!parsed?.state?.isAuthenticated) return null
    return parsed.state as { isAuthenticated: boolean; currentUser: { id: string; role: string; email?: string } }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const auth = parseAuth(request)
  const role = auth?.currentUser?.role
  const hasAdminAccess = role === 'owner' && isAdminEmail(auth?.currentUser?.email)

  // ── /admin/* ──────────────────────────────────────────────
  if (pathname.startsWith('/admin/login')) {
    if (hasAdminAccess) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!hasAdminAccess) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── /owner/* ──────────────────────────────────────────────
  if (pathname.startsWith('/owner/login')) {
    if (hasAdminAccess) {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/owner')) {
    if (!hasAdminAccess) {
      const url = new URL('/owner/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── /checkout ──────────────────────────────────────────────────────
  if (pathname === '/checkout' || pathname === '/checkout/') {
    if (!auth?.isAuthenticated) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('redirect', '/checkout')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── /auth/signin & /auth/register ─────────────────────────
  if (pathname === '/auth/signin' || pathname === '/auth/register') {
    if (auth?.isAuthenticated) {
      if (hasAdminAccess) return NextResponse.redirect(new URL('/owner/dashboard', request.url))
      const redirectTo = request.nextUrl.searchParams.get('redirect')
      return NextResponse.redirect(new URL(redirectTo || '/account', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*', '/auth/signin', '/auth/register', '/checkout'],
}
