import { permanentRedirect } from 'next/navigation'

/**
 * Portfolyo bölümü 21 Eki 2026'da KALDIRILDI (ablam, ABLAM-UART-DUZELTME-21EKI: "portfolyo tamamen kaldır,
 * içinde replikalar var"). Eski bağlantılar kırılmasın: sanatçı ana sayfasına kalıcı yönlendirme.
 */
export default async function PortfolioPage({ params }: { params: Promise<{ locale: string; artist: string }> }) {
  const { locale, artist } = await params
  permanentRedirect(`/${locale}/${artist}`)
}
