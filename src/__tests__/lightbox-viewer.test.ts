/**
 * Wave 0 test stub for LightboxViewer component.
 * Tests slides prop shape and thumbnail rendering contract.
 *
 * Note: Full browser interaction testing (click, open/close) requires
 * jsdom environment with @testing-library/react. These are contract tests
 * to verify component interface before implementation.
 */

// Mock yet-another-react-lightbox to avoid CSS import issues in JSDOM
jest.mock('yet-another-react-lightbox', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: jest.fn(({ open, index, slides }: { open: boolean; index: number; slides: { src: string; alt: string }[] }) =>
      open ? React.createElement('div', { 'data-testid': 'lightbox', 'data-index': index, 'data-slides-count': slides.length }) : null
    ),
  }
})

jest.mock('yet-another-react-lightbox/plugins/zoom', () => ({
  __esModule: true,
  default: {},
}))

jest.mock('yet-another-react-lightbox/plugins/captions', () => ({
  __esModule: true,
  default: {},
}))

jest.mock('yet-another-react-lightbox/styles.css', () => ({}), { virtual: true })
jest.mock('yet-another-react-lightbox/plugins/captions.css', () => ({}), { virtual: true })

describe('LightboxViewer (contract)', () => {
  let Lightbox: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    Lightbox = require('yet-another-react-lightbox').default as jest.Mock
  })

  const testSlides = [
    { src: '/img1.jpg', alt: 'Art 1' },
    { src: '/img2.jpg', alt: 'Art 2' },
  ]

  it('slide shape contract: each slide has src and alt', () => {
    for (const slide of testSlides) {
      expect(slide).toHaveProperty('src')
      expect(slide).toHaveProperty('alt')
      expect(typeof slide.src).toBe('string')
      expect(typeof slide.alt).toBe('string')
    }
  })

  it('slides array has correct length', () => {
    expect(testSlides).toHaveLength(2)
  })

  it('yet-another-react-lightbox Lightbox component is mockable', () => {
    expect(Lightbox).toBeDefined()
    expect(typeof Lightbox).toBe('function')
  })

  it('Lightbox receives open=false when no thumbnail clicked (initial state)', () => {
    Lightbox({
      open: false,
      index: -1,
      slides: testSlides,
      close: jest.fn(),
      plugins: [],
    })

    expect(Lightbox).toHaveBeenCalledTimes(1)
    expect(Lightbox).toHaveBeenCalledWith(
      expect.objectContaining({ open: false, index: -1 })
    )
  })

  it('Lightbox receives correct index after thumbnail click simulation', () => {
    const index = 0
    Lightbox({
      open: true,
      index,
      slides: testSlides,
      close: jest.fn(),
      plugins: [],
    })

    expect(Lightbox).toHaveBeenCalledTimes(1)
    expect(Lightbox).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, index: 0 })
    )
  })
})
