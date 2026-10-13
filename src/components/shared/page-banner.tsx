import Image from 'next/image'

export interface BannerImage {
  src: string
  alt: string
}

interface PageBannerProps {
  title: string
  /** Başlığın üstündeki küçük etiket (ör. "Koleksiyonlar"). */
  eyebrow?: string
  /** Sayfanın kendi eserlerinden seçilen görsel. Yoksa sade başlık çizilir
   *  (boş/gri bant yok — içi boş bölüm açmama kuralı). */
  image: BannerImage | null
  className?: string
}

/**
 * İç sayfa başlık bandı (sanatçı 11 Eki: "sayfa başlıklarında çok boş, banner
 * gibi resimli olabilir"). Görsel sayfanın kendi eserlerinden gelir, yeni
 * fotoğraf gerekmez. İlk ekrandaki en büyük öğe olduğu için LCP: `priority`.
 * Başlık okunurluğu: alttan karartma (beyaz metin ≥ 4.5:1 alt bölgede).
 */
export default function PageBanner({ title, eyebrow, image, className = '' }: PageBannerProps) {
  if (!image) {
    return (
      <header className={className}>
        {eyebrow && (
          <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">{eyebrow}</p>
        )}
        <h1 className={`${eyebrow ? 'mt-4 ' : ''}text-4xl leading-[1.1] tracking-[-0.01em] text-[var(--foreground)] sm:text-5xl lg:text-6xl`}>
          {title}
        </h1>
      </header>
    )
  }

  return (
    <header className={`relative aspect-[4/3] overflow-hidden bg-[#ece7de] sm:aspect-[21/9] ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1440px) 100vw, 1344px"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        {eyebrow && (
          <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-white/85">{eyebrow}</p>
        )}
        <h1 className={`${eyebrow ? 'mt-3 ' : ''}max-w-[20ch] text-4xl leading-[1.1] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl`}>
          {title}
        </h1>
      </div>
    </header>
  )
}

/** Bir eser listesinden banner görseli: önce admin hero_order sırası, yoksa ilk görselli eser. */
export function bannerFromProducts(
  products: { titleTr: string; titleEn: string; heroOrder?: number | null; images?: { url: string; altTr?: string | null; altEn?: string | null }[] }[],
  locale: string,
  skip = 0,
): BannerImage | null {
  const withImg = products.filter((p) => p.images?.[0]?.url)
  const ordered = [
    ...withImg.filter((p) => p.heroOrder != null).sort((a, b) => (a.heroOrder as number) - (b.heroOrder as number)),
    ...withImg.filter((p) => p.heroOrder == null),
  ]
  const p = ordered[skip] ?? ordered[0]
  if (!p?.images?.[0]) return null
  const img = p.images[0]
  const isTr = locale === 'tr'
  return { src: img.url, alt: (isTr ? img.altTr : img.altEn) ?? (isTr ? p.titleTr : p.titleEn) }
}
