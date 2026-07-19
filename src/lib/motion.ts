/**
 * Hareket yardimcilari — bilerek 'use client' DISINDA tutulur.
 *
 * Bu fonksiyonlar sunucu bilesenlerinden de cagrilir (or. ArtworkGrid).
 * Bir 'use client' modulunden export edilirse Next.js bunu istemci
 * referansina cevirir ve sunucudan cagrildiginda soyle patlar:
 * "Attempted to call staggerDelay() from the server but staggerDelay is
 * on the client."
 */

/**
 * Grid icin kademeli giris gecikmesi (saniye).
 *
 * Kademe kucuk ve ustten sinirli: 46 gorselli bir gride girildiginde son
 * kart saniyelerce beklemesin diye `max` karttan sonra gecikme sabitlenir.
 */
export function staggerDelay(index: number, step = 0.06, max = 6) {
  return Math.min(index, max) * step
}
