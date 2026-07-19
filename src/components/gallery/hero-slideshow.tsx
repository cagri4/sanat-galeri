'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Ana sayfa hero slaytlari — 5 farkli seriden birer eser.
 *
 * TASARIM KARARLARI
 * - object-contain: eserler duz zeminde fotograflanmis kaplar. object-cover
 *   tam ekran yukseklikte vazoyu asiri buyutup kirpiyordu; kap butun
 *   gorunmeli. "Eser yildiz" ilkesi.
 * - Crossfade YERINE kayan serit: parmakla suruklerken slaytin parmagi
 *   TAKIP etmesi (yapisik his) ancak translate ile mumkun. Gecis suresi
 *   yine yavas/sakin tutuldu (700ms ease-out), muze sukuneti korunuyor.
 * - JS YOKSA: serit translate(0) oldugundan ilk eser tam gorunur; sayfa
 *   kirilmaz, hicbir icerik gizli kalmaz.
 *
 * DOKUNMA / SURUKLEME
 * - Pointer Events: fare ve dokunma tek kod yolundan yonetiliyor.
 * - touch-action: pan-y  -> DIKEY KAYDIRMA TARAYICIYA BIRAKILIR. Klasik
 *   hata budur; yatay swipe icin touch-action:none verilirse sayfa asagi
 *   kaymaz hale gelir.
 * - Eksen kilidi: ilk anlamli harekette |dx| ve |dy| karsilastirilir.
 *   Dikey baskinsa surukleme IPTAL edilir ve sayfa normal kayar.
 * - Esik: mesafe genisligin %18'i VEYA hizli birakma (flick). Cok hassas
 *   olmasin diye tek basina kucuk mesafe yetmez.
 * - Suruklerken otomatik gecis durur, birakinca yeniden baslar.
 * - Suruklemeden sonra gelen "click" bastirilir; yoksa kaydirinca eser
 *   sayfasina gidiyordu.
 *
 * ERISILEBILIRLIK
 * - role="region" + aria-roledescription="carousel", ok tuslariyla gezinme.
 * - Noktalar: kac slayt var / hangisindeyiz; tiklanabilir, aria-current.
 * - prefers-reduced-motion: otomatik gecis ve kayma animasyonu kapali;
 *   ok tuslari ve noktalarla elle gezinme calismaya devam eder.
 */

export interface HeroSlide {
  slug: string
  title: string
  image: string
  alt: string
  category: string
}

const INTERVAL = 6000
/** Slayt degistirmek icin gereken minimum surukleme orani (genislige gore). */
const DISTANCE_RATIO = 0.18
/** Bu hizin uzerinde birakilirsa mesafe kucuk olsa da slayt degisir (flick). */
const FLICK_VELOCITY = 0.5 // px/ms
/** Eksen kilidi bu kadar px hareketten sonra karara baglanir. */
const AXIS_LOCK_PX = 8

type DragAxis = 'undecided' | 'horizontal' | 'vertical'

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
  const [dragPx, setDragPx] = useState(0)
  const [dragging, setDragging] = useState(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  // Duraklatma nedenleri AYRI tutulur: surukleme bitince fare hala uzerinde
  // olabilir. Tek bayrakla yonetince surukleme sonrasi otomatik gecis, imlec
  // hero'nun uzerindeyken yeniden basliyordu.
  const hovering = useRef(false)
  const interacting = useRef(false)
  const suppressClick = useRef(false)
  const drag = useRef<{
    id: number
    startX: number
    startY: number
    startT: number
    axis: DragAxis
  } | null>(null)

  const count = slides.length
  const clamp = useCallback((i: number) => Math.max(0, Math.min(count - 1, i)), [count])
  const go = useCallback((i: number) => setIndex((prev) => clamp(typeof i === 'number' ? i : prev)), [clamp])

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setEnhanced(true)
  }, [])

  // Otomatik gecis — hareket azaltmada ve etkilesim sirasinda durur.
  useEffect(() => {
    if (!enhanced || reduce || count < 2) return
    const id = setInterval(() => {
      if (hovering.current || interacting.current || drag.current) return
      setIndex((i) => (i + 1) % count)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [enhanced, reduce, count])

  /* ---- Surukleme ---------------------------------------------------- */

  function onPointerDown(e: React.PointerEvent) {
    if (count < 2) return
    // Sag tik / orta tik surukleme baslatmasin.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startT: performance.now(),
      axis: 'undecided',
    }
    interacting.current = true
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return

    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (d.axis === 'undecided') {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
      // Dikey baskinsa: surukleme iptal, sayfa normal kaysin.
      if (Math.abs(dy) > Math.abs(dx)) {
        d.axis = 'vertical'
        drag.current = null
        interacting.current = false
        setDragging(false)
        setDragPx(0)
        return
      }
      d.axis = 'horizontal'
      setDragging(true)
      // Yatay oldugu netlesti; pointer'i yakala ki disari cikinca da izleyelim.
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    }

    if (d.axis !== 'horizontal') return

    // Uclarda direnc: sona gelince serit lastik gibi zorlansin.
    const atStart = index === 0 && dx > 0
    const atEnd = index === count - 1 && dx < 0
    setDragPx(atStart || atEnd ? dx * 0.35 : dx)
  }

  function endDrag(e: React.PointerEvent) {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const width = viewportRef.current?.offsetWidth ?? 1
    const dx = e.clientX - d.startX
    const dt = Math.max(1, performance.now() - d.startT)
    const velocity = Math.abs(dx) / dt

    if (d.axis === 'horizontal') {
      const passed = Math.abs(dx) > width * DISTANCE_RATIO || velocity > FLICK_VELOCITY
      if (passed && Math.abs(dx) > AXIS_LOCK_PX) {
        go(index + (dx < 0 ? 1 : -1))
        // Anlamli surukleme sonrasi gelen click'i yut.
        suppressClick.current = true
        setTimeout(() => (suppressClick.current = false), 0)
      }
    }

    drag.current = null
    setDragging(false)
    setDragPx(0)
    interacting.current = false
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (count < 2) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  if (count === 0) return null
  const active = slides[index] ?? slides[0]

  // JS devralmadan once serit sabit durur (ilk eser gorunur).
  const offsetPct = enhanced ? -index * 100 : 0
  const trackStyle: React.CSSProperties = {
    transform: `translate3d(calc(${offsetPct}% + ${dragPx}px), 0, 0)`,
    transition: dragging || !enhanced || reduce ? 'none' : 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
  }

  return (
    <section
      className="full-bleed bg-[#f4f0e9]"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocusCapture={() => (hovering.current = true)}
      onBlurCapture={() => (hovering.current = false)}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={ctaLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          // pan-y: dikey kaydirma tarayicida kalir, yatayi biz yonetiriz.
          className={`relative aspect-[3/4] w-full touch-pan-y overflow-hidden select-none sm:aspect-[16/10] ${
            count > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
        >
          <div className="flex h-full w-full" style={trackStyle}>
            {slides.map((s, i) => (
              <div
                key={s.slug}
                className="relative h-full w-full shrink-0"
                aria-hidden={enhanced ? i !== index : i !== 0}
              >
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  draggable={false}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="pointer-events-none object-contain"
                />
              </div>
            ))}
          </div>
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

        {/* Slayt gostergeleri — kac slayt var, hangisindeyiz.
            pl-14 (mobil): sol alttaki sabit iletisim dugmesi ilk noktanin
            uzerine gelip dokunmayi engelliyordu. sm+ ekranda gerekmiyor. */}
        {count > 1 && (
          <div className="mt-8 flex items-center gap-3 pl-14 sm:pl-0">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}/${count} — ${s.title}`}
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
            <span aria-live="polite" className="sr-only">
              {`${index + 1} / ${count}`}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
