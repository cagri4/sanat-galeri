/**
 * Admin Auth Tests
 * Tests for (protected) admin layout server-side auth check.
 * Defense-in-depth against CVE-2025-29927.
 */

// Mock @/auth module before any imports
jest.mock('@/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

// Mock next/headers (required by next-auth server components)
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

import { redirect } from 'next/navigation'
import { auth } from '@/auth'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('ProtectedAdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls auth() to check session', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1', name: 'Admin' } } as never)

    // Dynamically import to allow per-test mock resets
    const { default: ProtectedAdminLayout } = await import(
      '@/app/(admin)/(protected)/layout'
    )

    const mockChildren = { type: 'div', props: {}, key: null } as never
    await ProtectedAdminLayout({ children: mockChildren })

    expect(mockAuth).toHaveBeenCalledTimes(1)
  })

  it('redirects to /admin/login when auth() returns null (no session)', async () => {
    mockAuth.mockResolvedValue(null as never)

    // Redirect throws in Next.js — simulate by calling it
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const { default: ProtectedAdminLayout } = await import(
      '@/app/(admin)/(protected)/layout'
    )

    const mockChildren = { type: 'div', props: {}, key: null } as never

    await expect(
      ProtectedAdminLayout({ children: mockChildren })
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })

  it('renders children when auth() returns a valid session', async () => {
    const session = { user: { id: '1', name: 'Admin' } }
    mockAuth.mockResolvedValue(session as never)

    const { default: ProtectedAdminLayout } = await import(
      '@/app/(admin)/(protected)/layout'
    )

    const mockChildren = 'test-children-content' as never
    const result = await ProtectedAdminLayout({ children: mockChildren })

    // Should NOT redirect
    expect(mockRedirect).not.toHaveBeenCalled()
    // Result should contain children (React fragment wraps children)
    expect(result).toBeDefined()
  })
})
