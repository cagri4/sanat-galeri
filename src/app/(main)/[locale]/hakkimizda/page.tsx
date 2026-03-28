import type { Metadata } from 'next'
import Image from 'next/image'
import { getCrossDomainLinks } from '@/components/shared/navbar'

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

  const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''
  const MELIKE_URL = process.env.NEXT_PUBLIC_MELIKE_URL ?? '#'
  const SEREF_URL = process.env.NEXT_PUBLIC_SEREF_URL ?? '#'
  const domainLinks = getCrossDomainLinks(locale, MAIN_URL, MELIKE_URL, SEREF_URL)

  return (
    <main>
      {/* Hero */}
      <section className="py-20 sm:py-28 max-w-3xl">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl font-light tracking-wide text-[#1a1a1a]">
          {isTr ? 'Hakkımızda' : 'About Us'}
        </h1>
        <p className="mt-8 text-base text-[#6b6b6b] leading-[1.8]">
          {isTr
            ? 'U-Art Tasarım, Melike Doğan ve Şeref Doğan tarafından kurulan bir sanat atölyesidir. Tablo, heykel, seramik ve baskı resim gibi farklı disiplinlerde özgün eserler üretiyoruz. Atölyemiz, geleneksel sanat formlarını çağdaş yaklaşımlarla birleştirerek, her eserde özgün bir ifade yaratmayı amaçlamaktadır.'
            : 'U-Art Design is an art studio founded by Melike Doğan and Şeref Doğan. We create original works across various disciplines including painting, sculpture, ceramics, and prints. Our studio aims to create unique expressions in every piece by combining traditional art forms with contemporary approaches.'}
        </p>
      </section>

      {/* Studio image — full bleed */}
      <section className="-mx-6 sm:-mx-10 lg:-mx-16 overflow-hidden">
        <div className="aspect-[16/6] relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80"
            alt={isTr ? 'Sanat atölyesi' : 'Art studio'}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* Artists */}
      <section className="py-20 sm:py-28">
        <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-light text-[#1a1a1a] mb-14">
          {isTr ? 'Sanatçılarımız' : 'Our Artists'}
        </h2>

        {/* Melike */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2 aspect-[3/4] relative overflow-hidden bg-[#f0ece4]">
            <Image
              src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80"
              alt="Melike Doğan"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="md:col-span-3 md:pt-8">
            <h3 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a]">
              Melike Doğan
            </h3>
            <p className="mt-4 text-[15px] text-[#6b6b6b] leading-[1.8]">
              {isTr
                ? 'Renk ve doku arasında köprüler kuran çok yönlü bir sanatçı. Eserleri, doğanın ve şehir yaşamının çarpıcı kontrastlarını yansıtır. Akrilik, yağlı boya ve karışık tekniklerle çalışır. İstanbul ve uluslararası galerilerde sergileri bulunan Melike, eserlerinde organik formlar ile geometrik yapıları harmanlayarak kendine özgü bir dil yaratır.'
                : 'A versatile artist building bridges between color and texture. Her works reflect the striking contrasts of nature and urban life. She works with acrylic, oil, and mixed media techniques. With exhibitions in Istanbul and international galleries, Melike creates a unique language by blending organic forms with geometric structures.'}
            </p>
            <a
              href={domainLinks.melike}
              className="mt-6 inline-block text-[13px] uppercase tracking-[0.15em] text-[#612E49] hover:text-[#4f243b] transition-colors"
            >
              {isTr ? 'Portfolyoyu Gör' : 'View Portfolio'} &rarr;
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16 border-t border-[#e8e4de]" />

        {/* Seref */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2 md:order-2 aspect-[3/4] relative overflow-hidden bg-[#f0ece4]">
            <Image
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80"
              alt="Şeref Doğan"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="md:col-span-3 md:order-1 md:pt-8">
            <h3 className="font-[family-name:var(--font-serif)] text-2xl font-light text-[#1a1a1a]">
              Şeref Doğan
            </h3>
            <p className="mt-4 text-[15px] text-[#6b6b6b] leading-[1.8]">
              {isTr
                ? 'Geleneksel teknikleri çağdaş yorumlarla buluşturan bir usta. Heykel, seramik ve enstalasyon çalışmalarıyla tanınır. Eserleri form ve boşluk arasındaki dengeyi araştırır. Toprak, taş ve metal gibi doğal malzemelerle çalışarak, izleyiciyi dokunsal bir deneyime davet eden üç boyutlu eserler üretir.'
                : 'A master blending traditional techniques with contemporary expression. Known for sculpture, ceramics, and installation works. His pieces explore the balance between form and space. Working with natural materials like clay, stone, and metal, he creates three-dimensional works that invite the viewer into a tactile experience.'}
            </p>
            <a
              href={domainLinks.seref}
              className="mt-6 inline-block text-[13px] uppercase tracking-[0.15em] text-[#612E49] hover:text-[#4f243b] transition-colors"
            >
              {isTr ? 'Portfolyoyu Gör' : 'View Portfolio'} &rarr;
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
