/**
 * Extracts product context prefix from message body.
 * Format: "[Eser: slug]\n\nrest of message"
 */
export function parseProductContext(body: string): {
  productSlug: string | null
  cleanBody: string
} {
  const match = body.match(/^\[Eser: ([^\]]+)\]\n\n([\s\S]*)$/)
  if (match) {
    return {
      productSlug: match[1],
      cleanBody: match[2],
    }
  }
  return {
    productSlug: null,
    cleanBody: body,
  }
}
