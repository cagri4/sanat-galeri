import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="tr" className="h-full antialiased" style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col bg-[#fbf9f5] text-[#1a1a1a]">{children}</body>
    </html>
  )
}
