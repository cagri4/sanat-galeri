/**
 * WhatsApp CTA utility.
 * Builds a wa.me deep link with pre-filled artwork inquiry message.
 */

export function buildWhatsAppHref(phone: string, artworkTitle: string, pageUrl: string): string {
  const normalised = phone.replace(/\D/g, '')
  const text = `Merhaba, "${artworkTitle}" eseri hakkinda bilgi almak istiyorum.\n${pageUrl}`
  return `https://wa.me/${normalised}?text=${encodeURIComponent(text)}`
}
