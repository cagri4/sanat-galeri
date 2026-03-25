import trMessages from '../messages/tr.json'
import enMessages from '../messages/en.json'

type NestedObject = { [key: string]: string | NestedObject }

function extractKeys(obj: NestedObject, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value as NestedObject, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

describe('i18n key parity', () => {
  it('tr.json and en.json have identical key structures', () => {
    const trKeys = new Set(extractKeys(trMessages as NestedObject))
    const enKeys = new Set(extractKeys(enMessages as NestedObject))

    const missingInEn = [...trKeys].filter((k) => !enKeys.has(k))
    const missingInTr = [...enKeys].filter((k) => !trKeys.has(k))

    const errorParts: string[] = []
    if (missingInEn.length > 0) {
      errorParts.push(`Keys in tr.json but missing in en.json:\n  ${missingInEn.join('\n  ')}`)
    }
    if (missingInTr.length > 0) {
      errorParts.push(`Keys in en.json but missing in tr.json:\n  ${missingInTr.join('\n  ')}`)
    }

    if (errorParts.length > 0) {
      throw new Error(`Key parity failure:\n\n${errorParts.join('\n\n')}`)
    }

    expect(trKeys.size).toBeGreaterThan(0)
    expect(trKeys.size).toBe(enKeys.size)
  })
})
