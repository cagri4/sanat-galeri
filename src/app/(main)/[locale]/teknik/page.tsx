import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Reveal from '@/components/motion/reveal'

/**
 * "Toprağın Hafızası: Terra Sigillata" teknik sayfasi.
 *
 * TUM METIN sanatcinin kendi yazdigi dokumandan alinmistir
 * (Drive: "Internet site duzeni.docx" -> SANATCI-SITE-DUZENI.md).
 * Hicbir bolumu uydurma degildir; duzenleme disinda metne dokunulmamistir.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terra' })
  return { title: t('title'), description: t('lead').split('\n\n')[0] }
}

/** Coklu paragrafi ayri <p>'lere bolerek okunur tutar. */
function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text.split('\n\n').filter(Boolean).map((p, i) => (
        <p key={i} className="max-w-[68ch] text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">
          {p}
        </p>
      ))}
    </div>
  )
}

export default async function TeknikPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terra' })
  const tc = await getTranslations({ locale, namespace: 'collection' })

  const sections = [
    { title: t('s1title'), body: t('s1body') },
    { title: t('s2title'), body: t('s2body') },
    { title: t('s3title'), body: t('s3body') },
    { title: t('s4title'), body: t('s4body') },
  ]

  return (
    <main className="py-16 sm:py-24">
      <Reveal as="section" className="max-w-2xl">
        <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-serif)] text-4xl font-light leading-[1.1] tracking-[-0.01em] text-[#1a1a1a] sm:text-5xl">
          {t('title')}
        </h1>
        <div className="mt-8">
          <Paragraphs text={t('lead')} />
        </div>
      </Reveal>

      <div className="mt-20 space-y-16">
        {sections.map((s, i) => (
          <Reveal as="section" key={s.title} delay={i === 0 ? 0 : 0.05}>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-light leading-snug text-[#1a1a1a] sm:text-3xl">
              {s.title}
            </h2>
            <div className="mt-5">
              <Paragraphs text={s.body} />
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-24 border-t border-[var(--rule)] pt-10">
        <Link
          href={`/${locale}/galeri?category=${encodeURIComponent('Antik Dönem Replikaları')}`}
          className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#1a1a1a]"
        >
          <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
            {tc('cta')}
          </span>
          <span aria-hidden className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1">
            →
          </span>
        </Link>
      </Reveal>
    </main>
  )
}
