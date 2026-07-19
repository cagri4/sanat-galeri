'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Ana sayfa hero slaytlari — 5 farkli seriden birer eser.
 *
 * TASARIM KARARLARI
 * - object-contain: eserler duz zeminde fotograflanmis kaplar. object-cover
 *   tam ekran yukseklikte vazoyu asiri buyutup kirpiyordu; kap butun
 *   goruneceksek contain sart. "Eser yildiz" ilkesi.
 * - Gecis yalnizca opacity (1.2sn crossfade) — kaydirma/zoom yok, muze
 *   sukuneti. Otomatik gecis 6sn.
 * - JS YOKSA: ilk slayt sunucudan tam gorunur gelir; digerleri de DOM'da
 *   ve erisilebilir durumda kalir (gizleme yalnizca istemcide baslar).
 * - prefers-reduced-motion: otomatik gecis ve crossfade kapali, yalnizca
 *   ilk eser gosterilir; noktalarla elle gezinmek yine calisir.
 * - Fare/klavye odagi uzerindeyken otomatik gecis durur.
 */

export interface HeroSlide {
  slug: string
  title: string
  image: string
  alt: string
  category: string
}

const INTERVAL = 6000

export default function HeroSlideshow({
  slides,
  locale,
  ctaLabel,
}: {
  slides: HeroSlide[]
  locale: string
  ctaLabel: string
}) {
  const [index, setIndex] = useState(0)
  const [enhanced, setEnhanced] = useState(false)
  const [reduce, setReduce] = useState(false)
  const paused = useRef(false)

  // Istemci devraldiktan sonra crossfade'i etkinlestir. Bu bayrak olmadan
  // sunucu HTML'i digerlerini opacity:0 ile gonderir ve JS yoksa tek eser
  // bile gorunmeyebilir.
  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setEnhanced(true)
  }, [])

  useEffect(() => {
    if (!enhanced || reduce || slides.length < 2) return
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % slides.length)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [enhanced, reduce, slides.length])

  if (slides.length === 0) return null
  const active = slides[index] ?? slides[0]

  return (
    <section
      className="full-bleed bg-[#f4f0e9]"
      aria-roledescription="carousel"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="relative aspect-[3/4] w-full sm:aspect-[16/10]">
          {slides.map((s, i) => (
            <div
              key={s.slug}
              className={
                enhanced
                  ? `absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-out-soft)] ${
                      i === index ? 'opacity-100' : 'opacity-0'
                    }`
                  : // JS oncesi: yalnizca ilk slayt akista, digerleri gizli degil
                    // sadece siralanmis halde (gorsel olarak ustuste binmez).
                    i === 0
                      ? 'absolute inset-0'
                      : 'hidden'
              }
              aria-hidden={enhanced ? i !== index : i !== 0}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Kunye: eser adi + koleksiyona link */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
              {active.category}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-light leading-tight text-[#1a1a1a] sm:text-4xl">
              <Link href={`/${locale}/urun/${active.slug}`} className="group inline-block">
                <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
                  {active.title}
                </span>
              </Link>
            </h2>
          </div>

          <Link
            href={`/${locale}/galeri?category=${encodeURIComponent(active.category)}`}
            className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#1a1a1a]"
          >
            <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-micro)] ease-out group-hover:bg-[length:100%_1px]">
              {ctaLabel}
            </span>
            <span aria-hidden className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Slayt secicileri — otomatik gecen icerikte elle kontrol sart */}
        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-3">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => setIndex(i)}
                aria-label={s.title}
                aria-current={i === index}
                className="group inline-flex h-11 w-8 items-center justify-center"
              >
                <span
                  className={`block h-px w-full transition-colors duration-[var(--dur-micro)] ${
                    i === index ? 'bg-[#1a1a1a]' : 'bg-[#cfc7ba] group-hover:bg-[#8a8175]'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
