/**
 * Wave 0 test stub for CategoryFilter component.
 * Tests category button rendering and URL search param updates.
 *
 * Note: Full rendering tests require @testing-library/react (jsdom environment).
 * These are unit-level contract tests for the component behavior.
 */

// Mock next/navigation before any imports
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// Contract tests — verify mocking works correctly
// Full rendering tests will be added in Plan 02 when component is implemented

describe('CategoryFilter (contract)', () => {
  const mockReplace = jest.fn()
  const mockRouter = { replace: mockReplace }
  const mockParams = new URLSearchParams()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/tr/galeri')
    ;(useSearchParams as jest.Mock).mockReturnValue(mockParams)
  })

  it('next/navigation hooks are mockable for CategoryFilter', () => {
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams()

    expect(router).toBeDefined()
    expect(pathname).toBe('/tr/galeri')
    expect(params).toBeDefined()
  })

  it('useRouter.replace can be called with category search param', () => {
    const router = useRouter()
    const pathname = usePathname()
    const params = new URLSearchParams()
    params.set('category', 'Tablo')
    router.replace(`${pathname}?${params.toString()}`)

    expect(mockReplace).toHaveBeenCalledWith('/tr/galeri?category=Tablo')
  })

  it('useRouter.replace can be called without category param (show all)', () => {
    const router = useRouter()
    const pathname = usePathname()
    const params = new URLSearchParams()
    params.delete('category')
    router.replace(`${pathname}?${params.toString()}`)

    expect(mockReplace).toHaveBeenCalledWith('/tr/galeri?')
  })

  it('verifies categories list shape that CategoryFilter will receive', () => {
    // Contract: CategoryFilter expects string[] categories and string|null active
    const categories: string[] = ['Tablo', 'Seramik']
    const active: string | null = null

    expect(Array.isArray(categories)).toBe(true)
    expect(categories).toContain('Tablo')
    expect(categories).toContain('Seramik')
    expect(active).toBeNull()
  })
})
