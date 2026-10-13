import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from './language-switcher'
import MobileMenu from './mobile-menu'
import { DesktopNav, InstagramLink, type NavItem } from './nav-menu'
import { headers } from 'next/headers'
import { kurumsalPath } from '@/lib/site'
import { CATEGORY_SLUGS } from '@/lib/categories'

export function buildDomainLink(baseUrl: string, path: string): string {
  try {
    const url = new URL(baseUrl)
    url.pathname = path
    return url.toString()
  } catch {
    return `${baseUrl}${path}`
  }
}

function buildArtistLink(mainUrl: string, artistUrl: string, locale: string, artist: string): string {
  // If artist URL is same as main URL → path-based routing (Vercel preview / single domain)
  // If different domain → subdomain routing (production)
  try {
    const main = new URL(mainUrl)
    const art = new URL(artistUrl)
    if (main.hostname === art.hostname) {
      // Same domain: use /locale/artist path
      return buildDomainLink(mainUrl, `/${locale}/${artist}`)
    }
    // Different domain: use subdomain/locale
    return buildDomainLink(artistUrl, `/${locale}`)
  } catch {
    return `/${locale}/${artist}`
  }
}

export function getCrossDomainLinks(
  locale: string,
  mainUrl: string,
  melikeUrl: string,
  serefUrl: string
) {
  return {
    main: buildDomainLink(mainUrl, `/${locale}`),
    gallery: buildDomainLink(mainUrl, `/${locale}/galeri`),
    collections: buildDomainLink(mainUrl, `/${locale}/koleksiyonlar`),
    about: buildDomainLink(mainUrl, `/${locale}/hakkimizda`),
    exhibition: buildDomainLink(mainUrl, `/${locale}/sergi/bozcaada-2010`),
    exhibitions: buildDomainLink(mainUrl, `/${locale}/sergiler`),
    collection: (category: string) =>
      buildDomainLink(mainUrl, `/${locale}/koleksiyonlar/${CATEGORY_SLUGS[category]}`),
    contact: buildDomainLink(mainUrl, `/${locale}/iletisim`),
    melike: buildArtistLink(mainUrl, melikeUrl, locale, 'melike'),
    seref: buildArtistLink(mainUrl, serefUrl, locale, 'seref'),
  }
}

interface NavbarProps {
  locale: string
  domain?: 'main' | 'melike' | 'seref'
}

export default async function Navbar({ locale }: NavbarProps) {
  const t = await getTranslations({ locale, namespace: 'nav' })

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://uarttasarim.com'
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? 'https://melike.uarttasarim.com'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? 'https://seref.uarttasarim.com'

  const links = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)
  const tc = await getTranslations({ locale, namespace: 'gallery.categories' })
  const host = (await headers()).get('host') ?? ''

  // Menü (sanatçının 11 Eki yapısı, Çağrı 13 Eki: Türkçe adlar).
  // Panolar kurumsal sitede yaşar: Galeri altında kurumsal siteye giden bağlantı.
  // "Üretim süreçleri" galeri sitesinde YOK (GOREV-A-LISTESI karar 5).
  const items: NavItem[] = [
    {
      href: links.gallery,
      label: t('gallery'),
      children: [
        {
          href: kurumsalPath(host, locale, '/projeler?tur=mimari-duvar-panolari'),
          label: tc('Mimari Duvar Panoları'),
          external: true,
        },
        { href: links.collection('Resimli Seramikler'), label: tc('Resimli Seramikler') },
        { href: links.collection('Seramik Heykeller'), label: t('sculptures') },
      ],
    },
    {
      href: links.collection('Antik Dönem Replikaları'),
      label: t('objects'),
      children: [{ href: links.collection('Antik Dönem Replikaları'), label: tc('Antik Dönem Replikaları') }],
    },
    {
      href: links.about,
      label: t('studio'),
      children: [
        { href: links.about, label: t('about') },
        { href: links.exhibitions, label: t('exhibitions') },
      ],
    },
    { href: links.contact, label: t('contact') },
  ]

  return (
    // Buzlu yapışkan şerit (Spode deseni, PLAN-TASARIM §2): zemin tam genişlik,
    // içerik sayfa konteyneriyle hizalı.
    <header className="site-header border-b border-[var(--rule)]">
      <nav aria-label="Ana menü" className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 sm:px-10 sm:py-6 lg:px-12">
        <a
          href={links.main}
          className="group inline-flex min-h-11 items-center gap-3 text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] hover:text-[var(--accent)]"
        >
          {/* Logo markasi 40px'te ic yazisi okunmaz, o yuzden yaninda kelime
              markasi duruyor; erisilebilirlik icin alt bos birakildi
              (bitisikteki metin zaten adi soyluyor). */}
          <Image
            src="/brand/uart-logo.png"
            alt=""
            width={150}
            height={150}
            priority
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          />
          <span className="text-lg font-medium tracking-tight sm:text-xl">
            Uarttasarım
          </span>
        </a>

        {/* Masaüstü: Galeri · Objeler · Stüdyo · İletişim, en sağda Instagram + dil.
            Kurumsal siteye geçiş Galeri ▾ Mimari Duvar Panoları ↗ ve footer'da. */}
        <div className="hidden items-center gap-6 md:flex">
          <DesktopNav items={items} submenuLabel={t('submenu')} />
          <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
            <InstagramLink label={t('instagram')} />
            <LanguageSwitcher />
          </div>
        </div>

        <MobileMenu items={items} menuLabel={t('menu')} instagramLabel={t('instagram')} />
      </nav>
    </header>
  )
}
