import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getArtistBySlug, getArtistExhibitions } from '@/lib/queries/artist'
import { getProductsByArtist } from '@/lib/queries/gallery'
import { isOnSite, siteDomains } from '@/lib/site'
import ContactForm from '@/components/gallery/contact-form'

/**
 * Şeref Doğan — bireysel portfolyo sitesi (tek sayfa, TR/EN). Dil: galeri minimalizmi
 * (rc 19 Eki, referans annvanhoey-ceramics.be): tam genişlik sakin hero, saf beyaz, bol boşluk,
 * eserler SERİ olarak (her eser kendi fotoğraflarıyla, yazısız masonry), menü yalnız gerçek içerik:
 * Eserler · Hakkında (biyografi, beyan, sergiler, ödüller) · İletişim.
 * İçerik YALNIZ veritabanından: biyografi, sergiler, ödüller, eserler.
 * Portre henüz yok → hero sanatçının kendi panosu (Bilginin Kaynağı detayı, adıyla).
 * Beyan veritabanında yok → STATEMENT_TASLAK (rc talimatı 20 Eki: sanatçının gerçek işine dayalı,
 * genel metin; tarih/sergi/özel bilgi içermez). DB'ye yazılmadı: galeri sitesindeki sanatçı
 * sayfasına onaysız metin düşmesin. Sanatçı onaylayınca DB'ye taşınır.
 * Eser detay sayfası burada YOK: kartlar eserin galeri/kurumsal sayfasına gider (kopya içerik yok).
 */
type P = { params: Promise<{ locale: string; artist: string }> }

const T = {
  tr: {
    role: 'Seramik sanatçısı · Çanakkale', bio: 'Biyografi', statement: 'Sanatçı beyanı', works: 'Eserler',
    about: 'Hakkında', exhibitions: 'Kişisel sergiler', awards: 'Ödüller', contact: 'İletişim',
    statementPending: 'Sanatçı beyanı hazırlanıyor.', detay: 'detay', cta: 'Eserleri gör',
    more: (n: number) => `Eser sayfası · ${n} fotoğraf`, open: 'Eser sayfası',
    joint: 'Ortak üretim: form Şeref Doğan, resimleme Melike Doğan.',
    contactLead: 'Sergi, proje ya da iş birliği için yazın; mesajınız Uarttasarım atölyesine ulaşır.',
    studio: 'Uarttasarım atölyesi', other: 'English',
    cats: { 'Mimari Duvar Panoları': 'Mimari seramik panolar', 'Seramik Heykeller': 'Seramik heykeller', 'Antik Dönem Replikaları': 'Antik dönem replikaları' } as Record<string, string>,
  },
  en: {
    role: 'Ceramic artist · Çanakkale', bio: 'Biography', statement: 'Artist statement', works: 'Work',
    about: 'About', exhibitions: 'Solo exhibitions', awards: 'Awards', contact: 'Contact',
    statementPending: 'The artist statement is in preparation.', detay: 'detail', cta: 'View the work',
    more: (n: number) => `Work page · ${n} photos`, open: 'Work page',
    joint: 'Joint production: form by Şeref Doğan, painting by Melike Doğan.',
    contactLead: 'Write for exhibitions, projects or collaborations; your message reaches the Uarttasarım studio.',
    studio: 'Uarttasarım studio', other: 'Türkçe',
    cats: { 'Mimari Duvar Panoları': 'Architectural ceramic panels', 'Seramik Heykeller': 'Ceramic sculpture', 'Antik Dönem Replikaları': 'Antique replicas' } as Record<string, string>,
  },
}

/** Hero (gerçek portre gelene kadar): sanatçının panosu, tam genişlik (rc 19 Eki redesign).
 *  79 yatay kare arasından seçildi: beyaz-yeşil dalga rölyefi, tek yatay eksen — referanstaki
 *  sakin, nötr hero'ya en yakın kare (2000×1125). Önceki kare hero Parion Esintisi seride duruyor. */
const HERO = { slug: 'bilginin-kaynagi', title: 'Bilginin Kaynağı', year: 2016, src: 'https://res.cloudinary.com/df0henatz/image/upload/v1791725081/uarttasarim/mimari/bilginin-kaynagi-2.jpg' }
/** Seri başına gösterilen fotoğraf (tek bant — sayfa sakin kalsın); tamamı eserin galeri/kurumsal sayfasında. */
const SERI_FOTO = 4

/** Cloudinary dönüşümü (genişlik sınırı + otomatik biçim); masonry'de doğal oran korunur. */
function cld(url: string, w: number) {
  return url.includes('/image/upload/') ? url.replace('/image/upload/', `/image/upload/c_limit,w_${w},f_auto,q_auto/`) : url
}

/** Taslak beyan — sanatçı onayı bekliyor (TODO). */
const STATEMENT_TASLAK: Record<string, { tr: string; en: string }> = {
  seref: {
    tr: `Seramikle çalışmak benim için toprağın belleğiyle konuşmak demek. Anadolu’nun binlerce yıllık birikimi, geçmiş uygarlıkların bıraktığı izler ve imgeler işlerimin çıkış noktası; ama amacım onları tekrar etmek değil, özlerine inip bugünün diliyle yeniden kurmak.

Mimari seramik panolarda yüzeyi, bulunduğu mekânla birlikte düşünürüm: duvar, ışık ve önünden geçen insanlar işin bir parçasıdır. Antik dönem replikalarında tornada formu kurarken eski ustaların oranlarını ve sabrını yeniden öğrenirim. Heykellerde ise yalınlığın, arınmışlığın ve içten gelen hareketin peşindeyim.

Her işte aynı soruya dönüyorum: Gereksiz olan çıkarıldığında geriye ne kalır? Bence geriye kalan, toprağın, ateşin ve elin birlikte bıraktığı izdir.`,
    en: `For me, working with clay means talking with the memory of the earth. Anatolia’s thousands of years of heritage, and the traces and images left by past civilisations, are where my work begins; yet my aim is not to repeat them but to reach their essence and rebuild it in today’s language.

In architectural ceramic panels I think of the surface together with the space it lives in: the wall, the light and the people passing by are part of the work. In the antique replicas, shaping the form on the wheel, I relearn the proportions and the patience of the old masters. In sculpture I look for simplicity, purity and a movement that comes from within.

In every piece I return to the same question: what remains when everything unnecessary is taken away? I believe what remains is the trace left together by earth, fire and the hand.`,
  },
}

async function load(slug: string) {
  const artist = await getArtistBySlug(slug).catch(() => null)
  if (!artist?.id) return { artist, works: [], exhibitions: [] }
  const [works, exhibitions] = await Promise.all([
    getProductsByArtist(artist.id).catch(() => []),
    getArtistExhibitions(artist.id).catch(() => []),
  ])
  return { artist, works, exhibitions }
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, artist } = await params
  const { artist: a } = await load(artist)
  const tr = locale !== 'en'
  const name = (tr ? a?.nameTr : a?.nameEn) ?? 'Şeref Doğan'
  const bio: string = (tr ? a?.bioTr : a?.bioEn) ?? ''
  return {
    title: `${name} — ${tr ? 'Seramik sanatçısı' : 'Ceramic artist'}`,
    description: bio.split(/(?<=\.)\s/)[0]?.slice(0, 200) || undefined,
  }
}

/** Eserin tek indekslenen sayfası: galeri ya da kurumsal (bireysel sitede detay yok). */
function eserUrl(category: string, slug: string, locale: string) {
  const d = siteDomains()
  if (isOnSite(category, 'galeri')) return d.galeri ? `https://${d.galeri}/${locale}/urun/${slug}` : `/${locale}/urun/${slug}`
  return d.kurumsal ? `https://${d.kurumsal}/${locale}/projeler/${slug}` : `/${locale}/kurumsal/projeler/${slug}`
}

const label = 'text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]'
const pending = 'border border-dashed border-[#b45309] bg-[#fef3c7] text-[#422006]'
const wrap = 'mx-auto w-full max-w-[1280px] px-5 sm:px-10 lg:px-16'

type Work = Awaited<ReturnType<typeof getProductsByArtist>>[number]

/** Masonry: fotoğraflar doğal oranlarında, yazısız (referanstaki dizilim). */
function Masonry({ items }: { items: { key: string | number; src: string; alt: string; href: string; caption?: string }[] }) {
  return (
    <ul className="columns-2 gap-2.5 sm:gap-3 lg:columns-4">
      {items.map((it) => (
        <li key={it.key} className="mb-2.5 break-inside-avoid sm:mb-3">
          <a href={it.href} className="group block cursor-pointer">
            <span className="block overflow-hidden bg-[#f3f3f3]">
              {/* eslint-disable-next-line @next/next/no-img-element -- doğal oran için ölçüsüz img; Cloudinary boyutlar */}
              <img
                src={cld(it.src, 800)}
                srcSet={`${cld(it.src, 480)} 480w, ${cld(it.src, 800)} 800w, ${cld(it.src, 1200)} 1200w`}
                sizes="(max-width: 1024px) 50vw, 25vw"
                alt={it.alt}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full transition-opacity duration-300 group-hover:opacity-85"
              />
            </span>
            {it.caption && <span className="mt-2 block text-[length:var(--text-meta)] text-[var(--muted)]">{it.caption}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default async function BireyselPage({ params }: P) {
  const { locale, artist } = await params
  const tr = locale !== 'en'
  const t = tr ? T.tr : T.en
  const { artist: a, works, exhibitions } = await load(artist)
  const name = (tr ? a?.nameTr : a?.nameEn) ?? 'Şeref Doğan'
  const bio: string | null = (tr ? (a?.bioTr ?? a?.bioEn) : (a?.bioEn ?? a?.bioTr)) ?? null
  const statement: string | null =
    (tr ? (a?.statementTr ?? a?.statementEn) : (a?.statementEn ?? a?.statementTr)) ??
    (STATEMENT_TASLAK[artist] ? STATEMENT_TASLAK[artist][tr ? 'tr' : 'en'] : null)
  const sergiler = exhibitions.filter((e) => e.type !== 'odul')
  const oduller = exhibitions.filter((e) => e.type === 'odul')

  const title = (w: Work) => (tr ? w.titleTr : w.titleEn) ?? w.titleTr ?? ''
  const dims = (w: Work) => (tr ? w.dimensionsTr : w.dimensionsEn) ?? w.dimensionsTr
  const hero = works.find((w) => w.slug === HERO.slug)
  const byCat = (c: string) => works.filter((w) => w.category === c && w.images?.length)
  // Panolar ve heykel: her eser bir seri (yeniden eskiye). Replikalar tek seri: her eserin bir karesi.
  const gruplar = [
    { c: 'Mimari Duvar Panoları', items: byCat('Mimari Duvar Panoları').sort((x, y) => (y.year ?? 0) - (x.year ?? 0)) },
    { c: 'Seramik Heykeller', items: byCat('Seramik Heykeller') },
  ].filter((g) => g.items.length)
  const replikalar = byCat('Antik Dönem Replikaları')
  const d = siteDomains()
  const nav = [['eserler', t.works], ['hakkinda', t.about], ['iletisim', t.contact]]
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Person', name, jobTitle: tr ? 'Seramik sanatçısı' : 'Ceramic artist', worksFor: { '@type': 'Organization', name: 'Uarttasarım', url: d.galeri ? `https://${d.galeri}` : undefined } }

  return (
    <div className="w-full min-w-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-5`}>
          <a href={`/${locale}`} className="text-xl font-light tracking-[0.02em] text-[var(--foreground)]">{name}</a>
          <nav aria-label={name} className="flex items-center gap-6 sm:gap-8">
            {nav.map(([id, l]) => (
              <a key={id} href={`#${id}`} className="py-2 text-[length:var(--text-meta)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">{l}</a>
            ))}
            <a href={`/${tr ? 'en' : 'tr'}`} hrefLang={tr ? 'en' : 'tr'} className="py-2 text-[length:var(--text-meta)] text-[var(--faint)] transition-colors hover:text-[var(--foreground)]">{tr ? 'EN' : 'TR'}</a>
          </nav>
        </div>
      </header>

      {/* Hero: tam genişlik sakin eser fotoğrafı (üstüne yazı yok, karartma yok — eser olduğu gibi);
          ad + unvan + ince çerçeveli CTA altındaki beyaz alanda (referansın sade dili). */}
      <section aria-labelledby="ad">
        <div className="relative h-[72svh] min-h-[380px] w-full overflow-hidden bg-[#eeeeee]">
          <Image src={HERO.src} alt={`${HERO.title} (${HERO.year}) — ${name}`} fill priority className="object-cover" sizes="100vw" />
        </div>
        <div className={`${wrap} flex justify-end pt-3`}>
          {hero && (
            <a href={eserUrl(hero.category, hero.slug, locale)} className="text-[12px] text-[var(--faint)] hover:text-[var(--foreground)]">
              {HERO.title}, {HERO.year} — {t.detay}
            </a>
          )}
        </div>
        <div className={`${wrap} flex flex-col items-center pb-8 pt-16 text-center sm:pt-24`}>
          <h1 id="ad" className="text-5xl leading-[1.05] sm:text-7xl">{name}</h1>
          <p className="mt-5 text-[length:var(--text-lead)] font-light tracking-[0.04em] text-[var(--muted)]">{t.role}</p>
          <a href="#eserler" className="mt-10 inline-flex min-h-11 items-center border border-[var(--foreground)] px-7 text-[length:var(--text-meta)] uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white">{t.cta}</a>
        </div>
      </section>

      <main className={wrap}>
        <section id="eserler" className="pt-24 sm:pt-32">
          <h2 className="text-4xl sm:text-5xl">{t.works}</h2>
          <div className="mt-16 space-y-28 sm:mt-20 sm:space-y-36">
            {gruplar.map(({ c, items }) => (
              <div key={c}>
                <h3 className={`${label} border-t border-[var(--rule)] pt-6`}>{t.cats[c] ?? c}</h3>
                <div className="mt-12 space-y-20 sm:space-y-28">
                  {items.map((w) => {
                    const href = eserUrl(w.category, w.slug, locale)
                    const n = w.images.length
                    return (
                      <article key={w.id} aria-labelledby={`seri-${w.slug}`}>
                        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                          <div>
                            <h4 id={`seri-${w.slug}`} className="text-2xl font-light sm:text-3xl">{title(w)}</h4>
                            <p className="mt-2 text-[length:var(--text-meta)] text-[var(--muted)]">{[w.year, dims(w)].filter(Boolean).join(' · ')}</p>
                          </div>
                          <a href={href} className="inline-flex min-h-11 items-center text-[length:var(--text-meta)] text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline">
                            {n > SERI_FOTO ? t.more(n) : t.open} &rarr;
                          </a>
                        </div>
                        <Masonry items={w.images.slice(0, SERI_FOTO).map((im: { id?: number; url: string }, i: number) => ({ key: im.id ?? i, src: im.url, alt: `${title(w)}${w.year ? ` (${w.year})` : ''} — ${i + 1}`, href }))} />
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
            {replikalar.length > 0 && (
              <article aria-labelledby="seri-replikalar">
                <h3 id="seri-replikalar" className={`${label} border-t border-[var(--rule)] pt-6`}>{t.cats['Antik Dönem Replikaları']}</h3>
                <p className="mb-7 mt-12 max-w-[60ch] text-[length:var(--text-meta)] text-[var(--muted)]">{t.joint}</p>
                <Masonry items={replikalar.map((w) => ({ key: w.id, src: w.images[0].url, alt: title(w), href: eserUrl(w.category, w.slug, locale), caption: title(w) }))} />
              </article>
            )}
          </div>
        </section>

        <section id="hakkinda" className="pt-28 sm:pt-40">
          <h2 className="text-4xl sm:text-5xl">{t.about}</h2>
          <div className="mt-14 grid gap-x-16 gap-y-16 lg:grid-cols-[1fr_2fr]">
            <h3 className={label}>{t.bio}</h3>
            <div className="space-y-5">
              {bio?.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="max-w-[66ch] text-[length:var(--text-body)] font-light leading-[1.85] text-[#333]">{p}</p>
              ))}
            </div>

            <h3 className={label}>{t.statement}</h3>
            {statement ? (
              <div className="max-w-[60ch] space-y-5">
                {statement.split('\n\n').map((p, i) => (
                  <p key={i} className="text-xl font-light leading-[1.6] text-[var(--foreground)]">{p}</p>
                ))}
              </div>
            ) : (
              <p role="note" className={`max-w-xl px-5 py-4 text-[15px] ${pending}`}>{t.statementPending}</p>
            )}

            {sergiler.length > 0 && (<>
              <h3 className={label}>{t.exhibitions}</h3>
              <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
                {sergiler.map((e) => (
                  <li key={e.id} className="grid grid-cols-[4rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr]">
                    <span className="text-[length:var(--text-body)] font-light text-[var(--muted)]">{e.year}</span>
                    <div>
                      <p className="text-[length:var(--text-body)] text-[var(--foreground)]">{tr ? e.titleTr : e.titleEn}</p>
                      {e.location && <p className="mt-1 text-[length:var(--text-meta)] text-[var(--muted)]">{e.location}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </>)}

            {oduller.length > 0 && (<>
              <h3 className={label}>{t.awards}</h3>
              <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
                {oduller.map((e) => (
                  <li key={e.id} className="grid grid-cols-[4rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr]">
                    <span className="text-[length:var(--text-body)] font-light text-[var(--muted)]">{e.year}</span>
                    <p className="text-[length:var(--text-body)] text-[var(--foreground)]">{tr ? e.titleTr : e.titleEn}</p>
                  </li>
                ))}
              </ul>
            </>)}
          </div>
        </section>

        <section id="iletisim" className="pb-24 pt-28 sm:pb-32 sm:pt-40">
          <h2 className="text-4xl sm:text-5xl">{t.contact}</h2>
          <div className="mt-14 grid gap-x-16 gap-y-8 lg:grid-cols-[1fr_2fr]">
            <p className="max-w-[40ch] text-[length:var(--text-body)] font-light leading-[1.8] text-[#333]">{t.contactLead}</p>
            <div className="max-w-xl">
              <ContactForm source={`[${name} — bireysel site]`} />
            </div>
          </div>
        </section>
      </main>

      <footer className={`${wrap} flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] py-8 text-[length:var(--text-meta)] text-[var(--muted)]`}>
        <span>© {new Date().getFullYear()} {name}</span>
        {d.galeri && (
          <Link href={`https://${d.galeri}/${locale}`} className="hover:text-[var(--foreground)]">{t.studio} &rarr;</Link>
        )}
      </footer>
    </div>
  )
}
