import type { Metadata } from 'next'
import './globals.css'
import { Inter, EB_Garamond, Jost, IBM_Plex_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import { isIndexable, alternatesFor, PATH_HEADER } from '@/lib/seo'
import { ownDomain } from '@/lib/site'

// İki site tipografisi — PLAN-TASARIM-2026-10-11.md §1 (ui-ux-pro-max, Çağrı onayı).
//  - Galeri: başlık EB Garamond 500 (cmap tam + TRK locl), gövde Jost
//  - Kurumsal: Inter (başlık+gövde) + IBM Plex Mono (künye/ölçü)
// Hepsinde ğĞıİşŞçÇöÖüÜâÂîÎûÛ fontTools ile doğrulandı.
// Türkçe ğ ı ş İ latin-ext'te; ikisi birlikte yüklenmeli.
// Inter da next/font ile: globals.css'teki Google Fonts @import'u Tailwind v4
// derlemesinde düşüyordu (dosya başında değil) → site Inter yerine sistem
// fontuyla görünüyordu (2026-10-10'da prod'da da doğrulandı).
const sans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})
const display = EB_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-garamond',
  display: 'swap',
})
const galeriSans = Jost({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jost',
  display: 'swap',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export async function generateMetadata(): Promise<Metadata> {
  // Kanonik alan adı: projenin kendi sitesi (UART_SITE) ve alan adı değişkeni.
  const domain = ownDomain()
  const alternates = domain ? alternatesFor((await headers()).get(PATH_HEADER)) : null
  return {
    title: 'Uarttasarım',
    description: 'Sanat galerisi',
    ...(domain ? { metadataBase: new URL(`https://${domain}`) } : {}),
    ...(alternates ? { alternates } : {}),
    // Geçici adreste indeksleme yok (lib/seo.ts). Alt segmentler `robots`
    // tanımlamadığı için bu değer tüm sayfalara geçer.
    ...(isIndexable() ? {} : { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }),
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${sans.variable} ${display.variable} ${galeriSans.variable} ${mono.variable} h-full antialiased [overflow-x:clip]`} style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#2C2C2C] [overflow-x:clip]">{children}</body>
    </html>
  )
}
