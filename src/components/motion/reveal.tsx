'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * Scroll-reveal: yumusak fade + cok hafif yukari kayma.
 *
 * TASARIM KARARI 1 — neden CSS, neden animasyon kutuphanesi degil:
 * Bir animasyon kutuphanesiyle (motion/framer-motion) `whileInView`
 * kullanildiginda baslangic durumu SUNUCU HTML'ine `opacity:0` olarak
 * gomuluyor. JS yavas yuklenirse ya da hic yuklenmezse TUM galeri kalici
 * olarak gorunmez kaliyor — bir sanat galerisi icin kabul edilemez.
 * Akis tersine cevrildi: sunucu HTML'i her zaman TAM GORUNUR, gizleme
 * yalnizca istemcide ve yalnizca ekran disindaki ogelere uygulanir.
 *
 * TASARIM KARARI 2 — neden IntersectionObserver degil:
 * IO yalnizca esik DEGISIMINDE tetiklenir. Kullanici End tusuna basip
 * sayfayi tek karede sona atlarsa, aradaki ogeler "ekranin altinda"
 * durumundan "ekranin ustunde" durumuna gecer; kesisim orani 0'dan 0'a
 * gittigi icin IO HIC tetiklenmez ve o kartlar kalici olarak bos kalir
 * (yukari donuldugunde goruluyor). Bunun yerine rAF ile kisilmis tek bir
 * paylasimli scroll dinleyicisi kullaniliyor: konum her durumda dogru
 * degerlendiriliyor.
 */

/** Ekranin bu oranindan yukarisi "gorunur" sayilir. */
const VISIBLE_RATIO = 0.9

/* --- Paylasimli kayit: kac Reveal olursa olsun tek dinleyici --------- */
const pending = new Set<HTMLElement>()
let listening = false
let queued = false

function flush() {
  queued = false
  const limit = window.innerHeight * VISIBLE_RATIO
  for (const el of pending) {
    if (el.getBoundingClientRect().top < limit) {
      el.dataset.reveal = 'in'
      pending.delete(el)
    }
  }
  if (pending.size === 0) stop()
}

function onScroll() {
  if (queued) return
  queued = true
  requestAnimationFrame(flush)
}

function start() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
}

function stop() {
  if (!listening) return
  listening = false
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
}

interface RevealProps {
  children: ReactNode
  /** Sirali giris icin gecikme (sn). Grid'lerde staggerDelay(i) ile. */
  delay?: number
  className?: string
  as?: 'div' | 'section'
}

export default function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Hareket azaltma tercihi: hicbir sey gizleme, icerik oldugu gibi kalsin.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Ilk ekranda gorunen icerik gizlenmez — sayfa aninda "dolu" acilir ve
    // gorunur bir ogenin once kaybolup sonra gelmesi (titreme) olusmaz.
    if (el.getBoundingClientRect().top < window.innerHeight * VISIBLE_RATIO) return

    el.style.setProperty('--reveal-delay', `${delay}s`)
    el.dataset.reveal = 'hidden'
    pending.add(el)
    start()

    return () => {
      pending.delete(el)
      if (pending.size === 0) stop()
    }
  }, [delay])

  const Tag = as
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}
