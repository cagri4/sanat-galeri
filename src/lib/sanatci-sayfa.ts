/**
 * Sanatçı sayfaları (uarttasarim.com /melike, /seref) — ablamın 21 Eki düzeltmeleri (ABLAM-UART-DUZELTME-21EKI.md).
 * - Sergiler sekmesi: YALNIZ fotoğraf, sergi adı/galeri/yıl YAZILMAZ.
 *     Melike: Drive "Hakkımızda > Melike Sergiler" (14 foto, scripts/ablam-21eki.py → ablam-21eki.json).
 *     Şeref : sitedeki MEVCUT sergi fotoğrafları (exhibition_photos), afişler ve Şeref'e ait olmayan kareler hariç.
 * - Şeref Projeler: Assos Athena Tapınağı Seramik Maketi (Drive "Projeler", metin Drive'daki belgeden — uydurma yok).
 */
import { getExhibitionPhotosBySlugs } from '@/lib/queries/exhibition-photos'
import { SERGI_AFISI, SERGI_KUNYE } from '@/lib/yeni-icerik'
import yeni from '@/lib/ablam-21eki.json'

/** Şeref'in sergi kareleri arasından çıkarılanlar (21 Eki görsel inceleme): 132–135 "Bendeki Seramik Olgusu"
 *  karelerinde Melike'nin Masalın Hafızası heykelleri (Anka) ve resimler; 146'da Melike'nin resimleri baskın. */
const SEREF_SERGI_HARIC = new Set([132, 133, 134, 135, 146])

export type SergiFoto = { src: string; alt: string }

export async function sergiFotolari(artist: string, isTr: boolean, ad: string): Promise<SergiFoto[]> {
  const alt = (i: number) => `${ad} — ${isTr ? 'sergi fotoğrafı' : 'exhibition photo'} ${i + 1}`
  if (artist === 'melike') return yeni.melikeSergi.map((src, i) => ({ src, alt: alt(i) }))
  if (artist !== 'seref') return []
  let rows: Awaited<ReturnType<typeof getExhibitionPhotosBySlugs>> = []
  try {
    rows = await getExhibitionPhotosBySlugs([...Object.keys(SERGI_KUNYE), 'bozcaada-2010'])
  } catch {}
  return rows
    .filter((f) => f.titleTr !== SERGI_AFISI && !SEREF_SERGI_HARIC.has(f.id))
    .map((f, i) => ({ src: f.url, alt: alt(i) }))
}

/** Şeref — Projeler. Metin: Drive "Assos Athena Tapınağı’nın ölçekli seramik rekonstrüksiyonu.docx" (galeri kısa açıklaması
 *  + kısa kart metni). EN: aynı metnin çevirisi (belgedeki EN başlık korunarak). */
export const ASSOS = {
  title: { tr: 'Assos Athena Tapınağı Seramik Maketi', en: 'A Scale Ceramic Reconstruction of the Temple of Athena at Assos' },
  kunye: { tr: 'Şeref Doğan ve Melike Doğan, 2009 · Assos Antik Kenti, Çanakkale', en: 'Şeref Doğan and Melike Doğan, 2009 · Ancient City of Assos, Çanakkale' },
  tur: { tr: 'Üç boyutlu seramik mimari maket ve yerinde montaj', en: 'Three-dimensional ceramic architectural model, installed on site' },
  metin: {
    tr: 'Assos Athena Tapınağı Seramik Maketi, tapınağın özgün mimarisini üç boyutlu olarak yeniden canlandıran, arkeolojik alanın tarihsel dokusuyla bütünleşen sanatsal ve öğretici bir açık alan uygulamasıdır.',
    en: 'The ceramic model of the Temple of Athena at Assos brings the temple’s original architecture back to life in three dimensions — an artistic and educational open-air work that blends into the historic fabric of the archaeological site.',
  },
  fotolar: yeni.assos,
}
