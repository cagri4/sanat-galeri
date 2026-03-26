import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const DOMAIN_MAP: Record<string, string> = {
  'uarttasarim.com': 'main',
  'www.uarttasarim.com': 'main',
  'melike.uarttasarim.com': 'melike',
  'seref.uarttasarim.com': 'seref',
}

function getTenant(request: NextRequest): string {
  const hostname = request.headers.get('host') ?? ''
  // Local dev: ?tenant=melike query param override
  const tenantOverride = request.nextUrl.searchParams.get('tenant')
  if (tenantOverride) return tenantOverride
  // Vercel preview: hostname includes .vercel.app — default to 'main'
  if (hostname.includes('.vercel.app') || hostname.includes('localhost')) {
    return 'main'
  }
  return DOMAIN_MAP[hostname] ?? 'main'
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0. Skip API routes — let them handle themselves
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 1. Admin guard: check cookie BEFORE domain rewrite
  if (pathname.startsWith('/admin')) {
    // next-auth session cookie check
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

  // 2. Tenant detection
  const tenant = getTenant(request)

  if (tenant === 'main') {
    // Let next-intl handle locale routing for main domain
    return intlMiddleware(request)
  }

  // 3. Artist subdomain: rewrite path then run intl
  const url = request.nextUrl.clone()
  // Prepend tenant segment so (artist)/[locale]/[artist]/ resolves correctly
  // next-intl will detect locale from the rewritten URL
  url.pathname = `/${tenant}${pathname}`
  // Run intl middleware on rewritten URL
  const intlResponse = intlMiddleware(
    new Request(url.toString(), request) as NextRequest,
  )
  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
