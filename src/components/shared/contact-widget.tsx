'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * Sol altta sabit iletisim dugmesi + modal form.
 *
 * Mevcut altyapiyi kullanir: POST /api/contact -> `messages` tablosu
 * (admin panelinde goruluyor). Yeni uc/tablo YOK.
 *
 * ERISILEBILIRLIK
 * - role="dialog" + aria-modal + aria-labelledby
 * - ESC ile kapanir, arka plana tiklayinca kapanir
 * - Focus trap: Tab/Shift+Tab modal icinde doner
 * - Acilirken ilk alana odaklanir; kapaninca odak tetikleyen dugmeye doner
 * - Modal acikken arka plan kaydirmasi kilitlenir
 * - prefers-reduced-motion: giris animasyonu CSS tarafinda otomatik kapanir
 *   (globals.css icindeki genel kural), icerik her kosulda gorunur
 */

type Status = 'idle' | 'sending' | 'success' | 'error' | 'rate-limited'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function ContactWidget() {
  const t = useTranslations('contactWidget')
  const tc = useTranslations('contact')
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setStatus('idle')
    // Odagi tetikleyen dugmeye geri ver (klavye kullanicisi kaybolmasin).
    triggerRef.current?.focus()
  }, [])

  // ESC + focus trap
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const list = Array.from(nodes).filter((n) => n.offsetParent !== null)
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  // Arka plan kaydirmasini kilitle
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Acilista ilk alana odaklan
  useEffect(() => {
    if (open) firstFieldRef.current?.focus()
  }, [open])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
          // Honeypot — bot doldurursa sunucu sessizce yok sayar.
          website: form.get('website'),
        }),
      })
      if (res.ok) setStatus('success')
      else if (res.status === 429) setStatus('rate-limited')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const field =
    'w-full border border-[var(--rule)] bg-white px-3 py-2.5 text-[length:var(--text-body)] text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] placeholder:text-[#b5aea3] hover:border-[#cfc7ba] focus:border-[var(--accent)] focus:outline-none'

  return (
    <>
      {/* Sabit tetikleyici — sol alt */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2.5 rounded-full border border-[var(--rule)] bg-[#FAFAF8]/95 px-4 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C] shadow-[0_2px_12px_rgba(26,26,26,0.08)] backdrop-blur transition-colors duration-[var(--dur-micro)] hover:border-[var(--accent)] hover:text-[var(--accent)] sm:h-12"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          />
        </svg>
        <span className="hidden sm:inline">{t('trigger')}</span>
        <span className="sr-only sm:hidden">{t('trigger')}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Arka plan */}
          <button
            type="button"
            aria-label={t('close')}
            onClick={close}
            className="absolute inset-0 bg-[#2C2C2C]/40 backdrop-blur-[2px]"
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-widget-title"
            // page-in: mevcut CSS keyframe'i; reduced-motion'da otomatik kapali
            className="page-in relative m-0 w-full max-w-lg border border-[var(--rule)] bg-[#FAFAF8] p-6 shadow-[0_8px_40px_rgba(26,26,26,0.16)] sm:m-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
                  U-Art Tasarım
                </p>
                <h2
                  id="contact-widget-title"
                  className="mt-2 text-2xl font-medium text-[#2C2C2C] sm:text-3xl"
                >
                  {t('title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-[#999] transition-colors duration-[var(--dur-micro)] hover:text-[#2C2C2C]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden className="h-5 w-5">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {status === 'success' ? (
              <div className="py-10 text-center">
                <p className="text-xl font-medium text-[#2C2C2C]">
                  {tc('successMessage')}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex min-h-11 items-center border border-[#2C2C2C] px-6 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] hover:bg-[#2C2C2C] hover:text-white"
                >
                  {t('close')}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {/* Honeypot: ekran okuyuculardan ve kullanicidan gizli */}
                <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="cw-website">Website</label>
                  <input id="cw-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <div>
                  <label htmlFor="cw-name" className="mb-1.5 block text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
                    {tc('nameLabel')}
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="cw-name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    className={field}
                    placeholder={tc('namePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="cw-email" className="mb-1.5 block text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
                    {tc('emailLabel')}
                  </label>
                  <input
                    id="cw-email"
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    className={field}
                    placeholder={tc('emailPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="cw-message" className="mb-1.5 block text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[#999]">
                    {tc('messageLabel')}
                  </label>
                  <textarea
                    id="cw-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    className={`${field} resize-y`}
                    placeholder={tc('messagePlaceholder')}
                  />
                </div>

                {status === 'error' && (
                  <p role="alert" className="text-[length:var(--text-meta)] text-[#8a3d3d]">
                    {tc('errorMessage')}
                  </p>
                )}
                {status === 'rate-limited' && (
                  <p role="alert" className="text-[length:var(--text-meta)] text-[#8a3d3d]">
                    {t('rateLimited')}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex min-h-11 w-full items-center justify-center border border-[#2C2C2C] px-6 text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-label)] text-[#2C2C2C] transition-colors duration-[var(--dur-micro)] hover:bg-[#2C2C2C] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {status === 'sending' ? tc('submitting') : tc('submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
