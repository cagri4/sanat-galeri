import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getArtistBySlug, getArtistExhibitions } from '@/lib/queries/artist'
import { getProductsByArtist } from '@/lib/queries/gallery'
import { getExhibitionPhotosBySlugs, type ExhibitionPhoto } from '@/lib/queries/exhibition-photos'
import { SERGI_AFISI, SERGI_KUNYE } from '@/lib/yeni-icerik'
import { isOnSite, siteDomains } from '@/lib/site'
import ContactForm from '@/components/gallery/contact-form'

/**
 * Şeref Doğan — bireysel CV/portfolyo sitesi (tek sayfa, TR/EN).
 * İçerik YALNIZ veritabanından: biyografi, sergiler, ödüller, eserler.
 * Portre henüz yok → kimlik görseli olarak sanatçının kendi panosu (Akar'ın Deryası, adıyla).
 * Beyan veritabanında yok → STATEMENT_TASLAK (rc talimatı 20 Eki: sanatçının gerçek işine dayalı,
 * genel metin; tarih/sergi/özel bilgi içermez). DB'ye yazılmadı: galeri sitesindeki sanatçı
 * sayfasına onaysız metin düşmesin. Sanatçı onaylayınca DB'ye taşınır.
 * Eser detay sayfası burada YOK: kartlar eserin galeri/kurumsal sayfasına gider (kopya içerik yok).
 */
type P = { params: Promise<{ locale: string; artist: string }> }

const T = {
  tr: {
    role: 'Seramik sanatçısı · Çanakkale', bio: 'Biyografi', statement: 'Sanatçı beyanı', works: 'İşler',
    exhibitions: 'Kişisel sergiler', awards: 'Ödüller', contact: 'İletişim',
    statementPending: 'Sanatçı beyanı hazırlanıyor.', detay: 'detay',
    joint: 'Ortak üretim: form Şeref Doğan, resimleme Melike Doğan.',
    contactLead: 'Sergi, proje ya da iş birliği için yazın; mesajınız Uarttasarım atölyesine ulaşır.',
    studio: 'Uarttasarım atölyesi', other: 'English',
    cats: { 'Mimari Duvar Panoları': 'Mimari seramik panolar', 'Seramik Heykeller': 'Seramik heykeller', 'Antik Dönem Replikaları': 'Antik dönem replikaları' } as Record<string, string>,
  },
  en: {
    role: 'Ceramic artist · Çanakkale', bio: 'Biography', statement: 'Artist statement', works: 'Works',
    exhibitions: 'Solo exhibitions', awards: 'Awards', contact: 'Contact',
    statementPending: 'The artist statement is in preparation.', detay: 'detail',
    joint: 'Joint production: form by Şeref Doğan, painting by Melike Doğan.',
    contactLead: 'Write for exhibitions, projects or collaborations; your message reaches the Uarttasarım studio.',
    studio: 'Uarttasarım studio', other: 'Türkçe',
    cats: { 'Mimari Duvar Panoları': 'Architectural ceramic panels', 'Seramik Heykeller': 'Ceramic sculpture', 'Antik Dönem Replikaları': 'Antique replicas' } as Record<string, string>,
  },
}
const CAT_ORDER = ['Mimari Duvar Panoları', 'Seramik Heykeller', 'Antik Dönem Replikaları']

/** Kimlik görseli (gerçek portre gelene kadar): sanatçının panosu. */
const KIMLIK = { slug: 'akarin-deryasi', title: 'Akar’ın Deryası', year: 2016 }

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

  let photos: ExhibitionPhoto[] = []
  try {
    photos = (await getExhibitionPhotosBySlugs(Object.keys(SERGI_KUNYE))).filter((f) => f.titleTr !== SERGI_AFISI)
  } catch {}
  const kareFor = (year: number | null, place: string | null) => {
    const slug = Object.entries(SERGI_KUNYE).find(([, k]) => k.year === year && k.place === place)?.[0]
    return slug ? photos.find((f) => f.exhibitionSlug === slug) ?? null : null
  }

  const kimlik = works.find((w) => w.slug === KIMLIK.slug)
  const gruplar = CAT_ORDER.map((c) => ({ c, items: works.filter((w) => w.category === c) })).filter((g) => g.items.length)
  const d = siteDomains()
  const nav = [['biyografi', t.bio], ['beyan', t.statement], ['isler', t.works], ['sergiler', t.exhibitions], ['oduller', t.awards], ['iletisim', t.contact]]
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Person', name, jobTitle: tr ? 'Seramik sanatçısı' : 'Ceramic artist', worksFor: { '@type': 'Organization', name: 'Uarttasarım', url: d.galeri ? `https://${d.galeri}` : undefined } }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-6 sm:px-10 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="flex items-center justify-between gap-6 border-b border-[var(--rule)] py-6">
        <a href={`/${locale}`} className="text-lg text-[var(--foreground)]">{name}</a>
        <nav aria-label={name} className="hidden gap-6 md:flex">
          {nav.map(([id, l]) => (
            <a key={id} href={`#${id}`} className="text-[length:var(--text-meta)] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--foreground)]">{l}</a>
          ))}
        </nav>
        <a href={`/${tr ? 'en' : 'tr'}`} className="text-[length:var(--text-meta)] text-[var(--muted)] hover:text-[var(--foreground)]">{t.other}</a>
      </header>

      {/* Kimlik: ad, unvan ve sanatçının bir panosu (portre gelince değişir; eser adı alt yazıda). */}
      <section className="grid items-center gap-10 py-16 sm:py-24 md:grid-cols-[3fr_2fr]">
        <div>
          <p className={label}>{t.role}</p>
          <h1 className="mt-4 text-5xl leading-[1.05] text-[var(--foreground)] sm:text-7xl">{name}</h1>
        </div>
        {kimlik?.images?.[0] && (
          <figure className="w-full max-w-sm">
            <a href={eserUrl(kimlik.category, kimlik.slug, locale)} className="relative block aspect-[4/5] overflow-hidden bg-[#ece7de]">
              <Image src={kimlik.images[0].url} alt={`${KIMLIK.title} (${KIMLIK.year}) — ${name}`} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 384px" />
            </a>
            <figcaption className="mt-2 text-[length:var(--text-meta)] text-[var(--muted)]">{KIMLIK.title}, {KIMLIK.year} — {t.detay}</figcaption>
          </figure>
        )}
      </section>

      <section id="biyografi" className="scroll-mt-8 border-t border-[var(--rule)] py-14 md:grid md:grid-cols-[1fr_3fr] md:gap-12">
        <h2 className={label}>{t.bio}</h2>
        <div className="mt-6 space-y-5 md:mt-0">
          {bio
            ? bio.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.9] text-[#4a4a4a]">{p}</p>
              ))
            : null}
        </div>
      </section>

      <section id="beyan" className="scroll-mt-8 border-t border-[var(--rule)] py-14 md:grid md:grid-cols-[1fr_3fr] md:gap-12">
        <h2 className={label}>{t.statement}</h2>
        {statement ? (
          <div className="mt-6 max-w-3xl space-y-4 border-l-2 border-[var(--accent)] pl-6 md:mt-0">
            {statement.split('\n\n').map((p, i) => (
              <p key={i} className="text-xl italic leading-relaxed text-[var(--foreground)]">{p}</p>
            ))}
          </div>
        ) : (
          <p role="note" className={`mt-6 max-w-xl px-5 py-4 text-[15px] md:mt-0 ${pending}`}>{t.statementPending}</p>
        )}
      </section>

      <section id="isler" className="scroll-mt-8 border-t border-[var(--rule)] py-14">
        <h2 className={label}>{t.works}</h2>
        {gruplar.map(({ c, items }) => (
          <div key={c} className="mt-10">
            <h3 className="text-2xl text-[var(--foreground)]">{t.cats[c] ?? c}</h3>
            {c === 'Antik Dönem Replikaları' && <p className="mt-2 text-[length:var(--text-meta)] text-[var(--muted)]">{t.joint}</p>}
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((w) => (
                <li key={w.id}>
                  <a href={eserUrl(w.category, w.slug, locale)} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#ece7de]">
                      {w.images?.[0] && (
                        <Image src={w.images[0].url} alt={(tr ? w.titleTr : w.titleEn) ?? ''} fill className="object-cover transition-transform duration-[var(--dur-image)] group-hover:scale-[1.03]" sizes="(max-width: 640px) 50vw, 25vw" />
                      )}
                    </div>
                    <p className="mt-3 text-[15px] leading-snug text-[var(--foreground)]">{tr ? w.titleTr : w.titleEn}</p>
                    {w.year && <p className="text-[length:var(--text-meta)] text-[var(--muted)]">{w.year}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="sergiler" className="scroll-mt-8 border-t border-[var(--rule)] py-14 md:grid md:grid-cols-[1fr_3fr] md:gap-12">
        <h2 className={label}>{t.exhibitions}</h2>
        <ul className="mt-6 divide-y divide-[var(--rule)] md:mt-0">
          {sergiler.map((e) => {
            const kare = kareFor(e.year, e.location)
            return (
              <li key={e.id} className="grid grid-cols-[4rem_1fr] gap-4 py-5 sm:grid-cols-[5rem_1fr_8rem]">
                <span className="text-lg text-[var(--foreground)]">{e.year}</span>
                <div>
                  <p className="text-[length:var(--text-body)] text-[var(--foreground)]">{tr ? e.titleTr : e.titleEn}</p>
                  {e.location && <p className="mt-1 text-[length:var(--text-meta)] text-[var(--muted)]">{e.location}</p>}
                </div>
                {kare && (
                  <div className="relative col-start-2 aspect-[4/3] w-32 overflow-hidden bg-[#ece7de] sm:col-start-auto">
                    <Image src={kare.url} alt={`${tr ? e.titleTr : e.titleEn} — ${e.location ?? ''}`} fill className="object-cover" sizes="128px" />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section id="oduller" className="scroll-mt-8 border-t border-[var(--rule)] py-14 md:grid md:grid-cols-[1fr_3fr] md:gap-12">
        <h2 className={label}>{t.awards}</h2>
        <ul className="mt-6 divide-y divide-[var(--rule)] md:mt-0">
          {oduller.map((e) => (
            <li key={e.id} className="grid grid-cols-[4rem_1fr] gap-4 py-5 sm:grid-cols-[5rem_1fr]">
              <span className="text-lg text-[var(--foreground)]">{e.year}</span>
              <p className="text-[length:var(--text-body)] text-[var(--foreground)]">{tr ? e.titleTr : e.titleEn}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="iletisim" className="scroll-mt-8 border-t border-[var(--rule)] py-14 md:grid md:grid-cols-[1fr_3fr] md:gap-12">
        <h2 className={label}>{t.contact}</h2>
        <div className="mt-6 max-w-xl md:mt-0">
          <p className="mb-6 text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">{t.contactLead}</p>
          <ContactForm source={`[${name} — bireysel site]`} />
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] py-8 text-[length:var(--text-meta)] text-[var(--muted)]">
        <span>© {new Date().getFullYear()} {name}</span>
        {d.galeri && (
          <Link href={`https://${d.galeri}/${locale}`} className="hover:text-[var(--foreground)]">{t.studio} &rarr;</Link>
        )}
      </footer>
    </div>
  )
}
