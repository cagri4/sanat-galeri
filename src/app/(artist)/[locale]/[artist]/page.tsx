import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import LightboxViewer from '@/components/gallery/lightbox-viewer'
import { ASSOS, sergiFotolari } from '@/lib/sanatci-sayfa'
import { getArtistBySlug } from '@/lib/queries/artist'

// NOT: Baslik bandi (avatar + isim) ve alt navigasyon artik `layout.tsx`
// icinde. Bu sayfa yalnizca "Hakkinda" sekmesinin icerigidir.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}): Promise<Metadata> {
  const { locale, artist } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  try { data = await getArtistBySlug(artist) } catch {}

  const name = data
    ? ((locale === 'tr' ? (data.nameTr ?? data.nameEn) : (data.nameEn ?? data.nameTr)) ?? artist)
    : artist.charAt(0).toUpperCase() + artist.slice(1)

  return {
    title: t('artistTitle', { name }),
    description: t('artistDesc', { name }),
  }
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ locale: string; artist: string }>
}) {
  const { locale, artist } = await params
  const isTr = locale === 'tr'
  const t = await getTranslations({ locale, namespace: 'cv' })

  let data: Awaited<ReturnType<typeof getArtistBySlug>> | null = null
  try {
    data = await getArtistBySlug(artist)
  } catch {}
  const ad = data ? ((isTr ? (data.nameTr ?? data.nameEn) : (data.nameEn ?? data.nameTr)) ?? artist) : artist
  // Sergiler: yalnız fotoğraf (21 Eki); bölüm, fotoğraf varsa görünür.
  const sergi = await sergiFotolari(artist, isTr, ad)

  const bio = data ? (isTr ? (data.bioTr ?? data.bioEn) : (data.bioEn ?? data.bioTr)) : null
  const statement = data
    ? (isTr ? (data.statementTr ?? data.statementEn) : (data.statementEn ?? data.statementTr))
    : null

  return (
    <main>
      {/* HAKKINDA — sekmenin varsayilan icerigi.
          Sanatci biyografileri HENUZ YOK (Cagri'dan gelecek). Uydurma metin
          yazilmaz; onun yerine zarif bir bos-durum + atolyenin GERCEK
          koleksiyon tanitimi (sanatcinin kendi dokumanindan) gosterilir,
          boylece sayfa bos ekranla karsilamaz. Biyografi DB'ye girildigi anda
          bu blok otomatik olarak asil metne birakir. */}
      <section className="py-14 sm:py-20">
        <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">
          {artist === 'melike' ? t('storyTitle') : t('bioTitle')}
        </h2>

        {bio ? (
          <div className="mt-6 space-y-5">
            {String(bio).split('\n\n').filter(Boolean).map((para: string, i: number) => (
              <p
                key={i}
                className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.9] text-[#4a4a4a]"
              >
                {para}
              </p>
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <p className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.9] text-[#4a4a4a]">
              {t('studioIntro')}
            </p>
            <p className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.9] text-[#4a4a4a]">
              {t('studioIntro2')}
            </p>
            <p className="max-w-[62ch] border-l border-[var(--rule)] pl-5 text-[length:var(--text-meta)] leading-[1.8] text-[#8a8a8a]">
              {t('bioPending')}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <Link
            href={`/${locale}/koleksiyonlar/antik-donem-replikalari#terra-sigillata`}
            className="text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[var(--accent)] transition-colors duration-[var(--dur-micro)] hover:text-[#1f1f1f]"
          >
            {t('techniqueLink')} &rarr;
          </Link>
        </div>
      </section>

      {statement && (
        <section className="border-t border-[var(--rule)] py-12">
          <h2 className="mb-6 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">
            {t('statementTitle')}
          </h2>
          <blockquote className="max-w-3xl border-l-2 border-[var(--accent)] pl-6 text-xl font-medium italic leading-relaxed text-[#2C2C2C] sm:text-2xl">
            {statement}
          </blockquote>
        </section>
      )}

      {/* PROJELER (yalnız Şeref, 21 Eki): Assos Athena Tapınağı Seramik Maketi — metin Drive belgesinden. */}
      {artist === 'seref' && ASSOS.fotolar.length > 0 && (
        <section className="border-t border-[var(--rule)] py-12">
          <h2 className="text-2xl font-medium text-[#2C2C2C] sm:text-3xl">{t('projectsTitle')}</h2>
          <h3 className="mt-6 text-xl text-[#2C2C2C]">{isTr ? ASSOS.title.tr : ASSOS.title.en}</h3>
          <p className="mt-2 text-[length:var(--text-meta)] text-[var(--faint)]">{isTr ? ASSOS.kunye.tr : ASSOS.kunye.en} · {isTr ? ASSOS.tur.tr : ASSOS.tur.en}</p>
          <p className="mb-8 mt-4 max-w-[68ch] text-[length:var(--text-body)] leading-[1.9] text-[#4a4a4a]">{isTr ? ASSOS.metin.tr : ASSOS.metin.en}</p>
          <LightboxViewer
            slides={ASSOS.fotolar.map((src, i) => ({ src, alt: `${isTr ? ASSOS.title.tr : ASSOS.title.en} — ${i + 1}` }))}
            thumbnails={ASSOS.fotolar.map((src, i) => ({ src, alt: `${isTr ? ASSOS.title.tr : ASSOS.title.en} — ${i + 1}` }))}
          />
        </section>
      )}

      {sergi.length > 0 && (
        <section className="border-t border-[var(--rule)] py-12">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-medium text-[#2C2C2C] sm:text-3xl">
              {t('exhibitionsTitle')}
            </h2>
            <Link
              href={`/${locale}/${artist}/sergiler`}
              className="shrink-0 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[var(--accent)] transition-colors duration-[var(--dur-micro)] hover:text-[#1f1f1f]"
            >
              {t('viewAll')} &rarr;
            </Link>
          </div>
        </section>
      )}

    </main>
  )
}
