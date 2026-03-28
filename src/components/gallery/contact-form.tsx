'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ContactFormProps {
  productSlug: string
}

export default function ContactForm({ productSlug }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const t = useTranslations('contact')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')

    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('senderName'),
          email: form.get('senderEmail'),
          message: `[Eser: ${productSlug}] ${form.get('body')}`,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-6 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#612E49]/10 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-[#612E49]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[15px] text-[#1a1a1a]">{t('successMessage')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="senderName" className="block text-[13px] text-[#6b6b6b] mb-1.5">
          {t('nameLabel')}
        </label>
        <input
          id="senderName"
          name="senderName"
          type="text"
          required
          placeholder={t('namePlaceholder')}
          className="w-full px-4 py-3 bg-white border border-[#e8e4de] text-[15px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#612E49] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="senderEmail" className="block text-[13px] text-[#6b6b6b] mb-1.5">
          {t('emailLabel')}
        </label>
        <input
          id="senderEmail"
          name="senderEmail"
          type="email"
          required
          placeholder={t('emailPlaceholder')}
          className="w-full px-4 py-3 bg-white border border-[#e8e4de] text-[15px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#612E49] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-[13px] text-[#6b6b6b] mb-1.5">
          {t('messageLabel')}
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          placeholder={t('messagePlaceholder')}
          className="w-full px-4 py-3 bg-white border border-[#e8e4de] text-[15px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#612E49] transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          {t('submitting') === 'Gonderiliyor...' ? 'Bir hata oluştu. Lütfen tekrar deneyin.' : 'An error occurred. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-[#612E49] text-white text-[13px] uppercase tracking-[0.15em] px-8 py-4 hover:bg-[#4f243b] transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
