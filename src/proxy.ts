import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/lib/i18n/routing'
import { decideRoute } from '@/lib/site-routing'

// Next 16: `middleware` → `proxy` (node runtime). Site/adres kararları
// src/lib/site-routing.ts'te (saf fonksiyon, testli).
const intlMiddleware = createIntlMiddleware(routing)

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // 0. API route'ları kendi işini görür
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 1. Admin guard: alan adı kararlarından ÖNCE
  if (pathname.startsWith('/admin')) {
    const sessionCookie =
      request.cookies.get('authjs.session-token') ??
      request.cookies.get('__Secure-authjs.session-token')
    if (!sessionCookie && !pathname.startsWith('/admin/login')) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const host = request.headers.get('host') ?? ''
  const decision = decideRoute(host, pathname, search)

  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.location, request.url), 301)
  }

  if (decision.type === 'rewrite') {
    // next-intl locale'i istek başlığından okur (X-NEXT-INTL-LOCALE); rewrite
    // ederken bu başlığı biz koyuyoruz, yoksa EN sayfalar TR'ye düşer.
    const headers = new Headers(request.headers)
    headers.set('X-NEXT-INTL-LOCALE', decision.locale)
    const url = request.nextUrl.clone()
    url.pathname = decision.pathname
    return NextResponse.rewrite(url, { request: { headers } })
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // robots.txt / sitemap.xml locale'e yönlenmemeli (kökten servis edilir).
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
