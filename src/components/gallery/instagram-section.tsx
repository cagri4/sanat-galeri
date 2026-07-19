import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

/**
 * Instagram bolumu — CURATED (canli feed DEGIL).
 *
 * DURUSTLUK NOTU: Buradaki gorseller sanatcinin kendi eserlerinden secilmis
 * kare gorsellerdir. Belirli Instagram gonderileri OLDUKLARI IDDIA EDILMEZ;
 * baslik ve metin "bizi takip edin" dilindedir, "son gonderilerimiz" gibi
 * bir ifade bilerek kullanilmamistir. Boylece kullanici yanilmaz.
 *
 * Canli API kullanilmiyor: Instagram Basic Display / Graph API isletme
 * hesabi + token yenileme gerektiriyor, Cagri bunu istemedi.
 */

const IG_URL = 'https://www.instagram.com/uarttasarim'
const IG_HANDLE = '@uarttasarim'

interface Item {
  src: string
  alt: string
}

export default async function InstagramSection({
  locale,
  items,
}: {
  locale: string
  items: Item[]
}) {
  const t = await getTranslations({ locale, namespace: 'instagram' })
  if (items.length === 0) return null

  return (
    <section className="border-t border-[#e8e4de] py-20">
      <div className="text-center">
        <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
          Instagram
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl font-light text-[#1a1a1a] sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[length:var(--text-body)] leading-relaxed text-[#6b6b6b]">
          {t('body')}
        </p>
      </div>

      {/* 3'lu izgara (mobilde de 3): kare gorseller, kirpma yok denecek kadar az */}
      <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-3">
        {items.map((it, i) => (
          <a
            key={i}
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('followCta')} — ${IG_HANDLE}`}
            className="media-zoom group relative aspect-square overflow-hidden bg-[#f0ece4]"
          >
            <Image
              src={it.src}
              alt={it.alt}
              fill
              sizes="(max-width: 640px) 33vw, 30vw"
              className="object-cover group-hover:scale-[1.03]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[#1a1a1a] opacity-0 transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[0.06]"
            />
          </a>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-11 items-center gap-2.5 border border-[#1a1a1a] px-6 py-3 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#1a1a1a] transition-colors duration-[var(--dur-micro)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <span>{t('followCta')}</span>
        </a>
        <p className="mt-3 text-[length:var(--text-meta)] text-[#999]">{IG_HANDLE}</p>
      </div>
    </section>
  )
}
