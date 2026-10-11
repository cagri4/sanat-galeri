import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { isIndexable } from './src/lib/seo'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  // Geçici adreste indeksleme yok: HTML dışı yanıtlar (görsel, PDF) dahil
  // her yanıta X-Robots-Tag. Kaldırma: UART_INDEXABLE=true (SEO-GECIS-KONTROL.md).
  async headers() {
    if (isIndexable()) return []
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
  images: {
    remotePatterns: [
      {
        // Eser görselleri Supabase Storage'da (public "eserler" bucket'ı).
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        // Eser görselleri Cloudinary'ye taşındı (hesap: df0henatz).
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
