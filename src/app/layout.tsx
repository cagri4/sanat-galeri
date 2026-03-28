import type { Metadata } from 'next'
import './globals.css'

import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'U-Art Tasarim',
  description: 'Sanat galerisi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="h-full antialiased overflow-x-hidden" style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col bg-[#fbf9f5] text-[#1a1a1a] overflow-x-hidden">{children}</body>
    </html>
  )
}
