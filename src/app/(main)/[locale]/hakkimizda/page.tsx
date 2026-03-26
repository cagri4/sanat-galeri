import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { buildDomainLink } from '@/components/shared/navbar'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'Hakkımızda | U-Art Tasarım' : 'About | U-Art Design',
    description: isTr
      ? 'U-Art Tasarım sanat atölyesi hakkında'
      : 'About U-Art Design art studio',
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isTr = locale === 'tr'

  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'

  return (
    <main className="py-12 sm:py-16 lg:py-20">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-neutral-900">
            {isTr ? 'Hakkımızda' : 'About Us'}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {isTr
              ? 'U-Art Tasarım, Melike Yıldız ve Şeref Kaya tarafından kurulan bir sanat atölyesidir. Tablo, heykel, seramik ve baskı resim gibi farklı disiplinlerde özgün eserler üretiyoruz.'
              : 'U-Art Design is an art studio founded by Melike Yıldız and Şeref Kaya. We create original works across various disciplines including painting, sculpture, ceramics, and prints.'}
          </p>
          <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
            {isTr
              ? 'Atölyemiz, geleneksel sanat formlarını çağdaş yaklaşımlarla birleştirerek, her eserde özgün bir ifade yaratmayı amaçlamaktadır.'
              : 'Our studio aims to create unique expressions in every piece by combining traditional art forms with contemporary approaches.'}
          </p>
        </div>
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"
            alt={isTr ? 'Sanat atölyesi' : 'Art studio'}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Artists */}
      <section className="mt-16 sm:mt-20 pt-12 border-t border-neutral-100">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-10">
          {isTr ? 'Sanatçılarımız' : 'Our Artists'}
        </h2>

        {/* Melike */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80"
              alt="Melike Yıldız"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xl font-medium text-neutral-900">Melike Yıldız</h3>
            <p className="mt-3 text-neutral-600 leading-relaxed">
              {isTr
                ? 'Renk ve doku arasında köprüler kuran çok yönlü bir sanatçı. Eserleri, doğanın ve şehir yaşamının çarpıcı kontrastlarını yansıtır. Akrilik, yağlı boya ve karışık tekniklerle çalışır.'
                : 'A versatile artist building bridges between color and texture. Her works reflect the striking contrasts of nature and urban life. She works with acrylic, oil, and mixed media techniques.'}
            </p>
            <a
              href={buildDomainLink(MELIKE_URL, `/${locale}`)}
              className="mt-4 inline-block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900 transition-colors"
            >
              {isTr ? 'Portfolyoyu Gör' : 'View Portfolio'} &rarr;
            </a>
          </div>
        </div>

        {/* Seref */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80"
              alt="Şeref Kaya"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xl font-medium text-neutral-900">Şeref Kaya</h3>
            <p className="mt-3 text-neutral-600 leading-relaxed">
              {isTr
                ? 'Geleneksel teknikleri çağdaş yorumlarla buluşturan bir usta. Heykel, seramik ve enstalasyon çalışmalarıyla tanınır. Eserleri form ve boşluk arasındaki dengeyi araştırır.'
                : 'A master blending traditional techniques with contemporary expression. Known for sculpture, ceramics, and installation works. His pieces explore the balance between form and space.'}
            </p>
            <a
              href={buildDomainLink(SEREF_URL, `/${locale}`)}
              className="mt-4 inline-block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900 transition-colors"
            >
              {isTr ? 'Portfolyoyu Gör' : 'View Portfolio'} &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Studio */}
      <section className="mt-16 sm:mt-20 pt-12 border-t border-neutral-100">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-8">
          {isTr ? 'Atölyemiz' : 'Our Studio'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="aspect-[4/3] relative overflow-hidden col-span-2">
            <Image
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
              alt={isTr ? 'Atölye iç mekan' : 'Studio interior'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80"
              alt={isTr ? 'Çalışma alanı' : 'Workspace'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
