/**
 * Gizli içerik bayrağı (Çağrı, 11.10.2026): 20 gizli eser + 226 görsel +
 * sergi/yapım fotoğrafları + heykel metinleri "tasarım bitince birlikte
 * açılacak". Eserler is_visible ile gizli; exhibition_photos'ta görünürlük
 * alanı YOK — o yüzden "Sergiden kareler" ve "Yapım ve montaj" bölümleri bu
 * bayrağa bağlı. Açılış: Vercel'de UART_YENI_ICERIK=true + yeniden deploy,
 * eserlerin is_visible=true yapılmasıyla aynı onay turunda.
 */
export function yeniIcerikAcik(): boolean {
  return process.env.UART_YENI_ICERIK === 'true'
}

/**
 * Sergi afişleri exhibition_photos'ta title_tr = SERGI_AFISI ile işaretli
 * (Çağrı 11.10: afiş silinmez, sergi kaydının kendi görseli olarak kalır;
 * "Sergiden kareler" şeridi yalnız eser/mekân karesi gösterir).
 */
export const SERGI_AFISI = 'Sergi afişi'

/**
 * Sergi künyeleri — Şeref Doğan özgeçmişindeki "Seçilmiş Kişisel Sergiler"
 * listesinden BİREBİR (Drive Studio/Özgeçmişler/ŞEREF DOĞAN ÖZGEÇMİŞ1.jpg).
 * Anahtar: exhibition_photos.exhibition_slug (scripts/data/drive-import-2026-10.json).
 */
export const SERGI_KUNYE: Record<string, { title: string; place: string; year: number }> = {
  'nuve-nucleus-marina-2008': { title: 'Nüve / Nucleus', place: 'Marina Seyir Terası, Çanakkale', year: 2008 },
  'sinirsiz-artist-2008': { title: 'Sınırsız Sergisi', place: 'Artist 2008 İstanbul Sanat Fuarı, İstanbul', year: 2008 },
  'medeniyetler-polart-2009': { title: 'Medeniyetler', place: 'Polart Sanat Galerisi, Ankara', year: 2009 },
  'bozcaada-2010-ek': { title: 'Yolculuk', place: 'Bozcaada Sanat Galerisi, Çanakkale', year: 2010 },
  'yolculuk-2-aksit-2010': { title: 'Yolculuk 2', place: 'Akşit Sanat Galerisi, Ankara', year: 2010 },
  'yolculuklar-armagrandi-2011': { title: 'Yolculuklar', place: 'Armagrandi Otel Sanat Galerisi, Bozcaada, Çanakkale', year: 2011 },
  'bendeki-seramik-olgusu-arkeo-pera-2012': { title: 'Bendeki Seramik Olgusu', place: 'Arkeo Pera Sanat Galerisi, İstanbul', year: 2012 },
  'anadolu-ekininde-guzeller-akeramos-2017': { title: 'Anadolu Ekininde Güzeller', place: 'Akeramos Sanat Merkezi, Bursa', year: 2017 },
}
