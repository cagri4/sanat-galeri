/**
 * Unit tests for middleware domain routing logic.
 * Tests the 8 routing behaviors described in 01-02-PLAN.md.
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock next-intl/middleware
const mockIntlMiddlewareReturn = NextResponse.next()
const mockIntlMiddleware = jest.fn().mockReturnValue(mockIntlMiddlewareReturn)

jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: jest.fn(() => mockIntlMiddleware),
}))

// Mock the routing config
jest.mock('@/lib/i18n/routing', () => ({
  routing: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
  },
}))

// Import middleware AFTER mocks are set up
// We'll import the actual functions after setting up mocks
let middleware: (req: NextRequest) => Promise<NextResponse> | NextResponse

function makeRequest(
  url: string,
  options: { host?: string; cookies?: Record<string, string> } = {},
): NextRequest {
  const req = new NextRequest(url, {
    headers: {
      host: options.host ?? 'localhost:3000',
    },
  })
  if (options.cookies) {
    for (const [name, value] of Object.entries(options.cookies)) {
      req.cookies.set(name, value)
    }
  }
  return req
}

describe('Middleware domain routing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIntlMiddleware.mockReturnValue(NextResponse.next())
    // Re-import middleware fresh for each test
    jest.resetModules()
  })

  // We need to import after resetModules — use dynamic require
  function getMiddleware() {
    // Re-mock after resetModules
    jest.mock('next-intl/middleware', () => ({
      __esModule: true,
      default: jest.fn(() => mockIntlMiddleware),
    }))
    jest.mock('@/lib/i18n/routing', () => ({
      routing: {
        locales: ['tr', 'en'],
        defaultLocale: 'tr',
      },
    }))
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/middleware').default
  }

  describe('Main domain routing', () => {
    it('uarttasarim.com routes to main (intlMiddleware called, no tenant rewrite)', async () => {
      const mw = getMiddleware()
      const req = makeRequest('https://uarttasarim.com/', {
        host: 'uarttasarim.com',
      })
      await mw(req)
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
      // The URL passed to intl should NOT have a tenant prefix like /melike
      const callArg = mockIntlMiddleware.mock.calls[0][0] as Request
      const calledUrl = new URL(callArg.url)
      expect(calledUrl.pathname).toBe('/')
    })
  })

  describe('Artist subdomain routing', () => {
    it('melike.uarttasarim.com routes to (artist)/melike (URL rewritten with /melike prefix)', async () => {
      const mw = getMiddleware()
      const req = makeRequest('https://melike.uarttasarim.com/', {
        host: 'melike.uarttasarim.com',
      })
      await mw(req)
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
      const callArg = mockIntlMiddleware.mock.calls[0][0] as Request
      const calledUrl = new URL(callArg.url)
      expect(calledUrl.pathname).toMatch(/^\/melike/)
    })

    it('seref.uarttasarim.com routes to (artist)/seref (URL rewritten with /seref prefix)', async () => {
      const mw = getMiddleware()
      const req = makeRequest('https://seref.uarttasarim.com/', {
        host: 'seref.uarttasarim.com',
      })
      await mw(req)
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
      const callArg = mockIntlMiddleware.mock.calls[0][0] as Request
      const calledUrl = new URL(callArg.url)
      expect(calledUrl.pathname).toMatch(/^\/seref/)
    })
  })

  describe('Local dev tenant override', () => {
    it('?tenant=melike on localhost routes to (artist)/melike', async () => {
      const mw = getMiddleware()
      const req = makeRequest('http://localhost:3000/?tenant=melike', {
        host: 'localhost:3000',
      })
      await mw(req)
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
      const callArg = mockIntlMiddleware.mock.calls[0][0] as Request
      const calledUrl = new URL(callArg.url)
      expect(calledUrl.pathname).toMatch(/^\/melike/)
    })
  })

  describe('Admin guard', () => {
    it('/admin path without session cookie redirects to /admin/login', async () => {
      const mw = getMiddleware()
      const req = makeRequest('http://localhost:3000/admin', {
        host: 'localhost:3000',
      })
      const response = await mw(req)
      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/admin/login')
    })

    it('/admin/login path without session cookie does NOT redirect', async () => {
      const mw = getMiddleware()
      const req = makeRequest('http://localhost:3000/admin/login', {
        host: 'localhost:3000',
      })
      const response = await mw(req)
      // Should NOT be a redirect to /admin/login (would be infinite loop)
      if (response.status === 307 || response.status === 302) {
        const location = response.headers.get('location')
        expect(location).not.toContain('/admin/login')
      } else {
        expect(response.status).not.toBe(307)
      }
    })
  })

  describe('Fallback behaviors', () => {
    it('Vercel preview hostname (.vercel.app) defaults to main tenant', async () => {
      const mw = getMiddleware()
      const req = makeRequest('https://my-project.vercel.app/', {
        host: 'my-project.vercel.app',
      })
      await mw(req)
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
      const callArg = mockIntlMiddleware.mock.calls[0][0] as Request
      const calledUrl = new URL(callArg.url)
      // For main tenant, pathname should NOT be prefixed with artist name
      expect(calledUrl.pathname).not.toMatch(/^\/(melike|seref)/)
    })

    it('Unknown hostname defaults to main tenant', async () => {
      const mw = getMiddleware()
      const req = makeRequest('https://unknown-domain.com/', {
        host: 'unknown-domain.com',
      })
      await mw(req)
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
      const callArg = mockIntlMiddleware.mock.calls[0][0] as Request
      const calledUrl = new URL(callArg.url)
      // For main tenant, pathname should NOT be prefixed with artist name
      expect(calledUrl.pathname).not.toMatch(/^\/(melike|seref)/)
    })
  })
})
