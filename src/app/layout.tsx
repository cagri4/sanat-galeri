import type { Metadata } from 'next'
import './globals.css'
import { Inter, Newsreader, IBM_Plex_Mono } from 'next/font/google'

// İki site tipografisi (KARARLAR-2026-10-10 madde 4; test: preview-shots/
// font-turkce-test.png — ğĞıİşŞçÇöÖüÜâÂîÎûÛ cmap'te tam).
//  - Galeri başlıkları: Newsreader (editoryal serif, OFL)
//  - Kurumsal künye/ölçü: IBM Plex Mono
// Türkçe ğ ı ş İ latin-ext'te; ikisi birlikte yüklenmeli.
// Inter da next/font ile: globals.css'teki Google Fonts @import'u Tailwind v4
// derlemesinde düşüyordu (dosya başında değil) → site Inter yerine sistem
// fontuyla görünüyordu (2026-10-10'da prod'da da doğrulandı).
const sans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})
const display = Newsreader({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-newsreader',
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

export const metadata: Metadata = {
  title: 'Uarttasarım',
  description: 'Sanat galerisi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased overflow-x-hidden`} style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#2C2C2C] overflow-x-hidden">{children}</body>
    </html>
  )
}
