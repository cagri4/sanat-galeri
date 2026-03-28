'use client'

import { useState } from 'react'

interface ContactPageFormProps {
  locale: string
  labels: {
    name: string
    namePlaceholder: string
    email: string
    emailPlaceholder: string
    message: string
    messagePlaceholder: string
    submit: string
    submitting: string
    success: string
  }
}

export default function ContactPageForm({ locale, labels }: ContactPageFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#612E49]/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#612E49]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[15px] text-[#1a1a1a]">{labels.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-[13px] text-[#6b6b6b] mb-1.5">
          {labels.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={labels.namePlaceholder}
          className="w-full px-4 py-3 bg-white border border-[#e8e4de] text-[15px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#612E49] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-[13px] text-[#6b6b6b] mb-1.5">
          {labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={labels.emailPlaceholder}
          className="w-full px-4 py-3 bg-white border border-[#e8e4de] text-[15px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#612E49] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-[13px] text-[#6b6b6b] mb-1.5">
          {labels.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={labels.messagePlaceholder}
          className="w-full px-4 py-3 bg-white border border-[#e8e4de] text-[15px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#612E49] transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          {locale === 'tr' ? 'Bir hata oluştu. Lütfen tekrar deneyin.' : 'An error occurred. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-[#612E49] text-white text-[13px] uppercase tracking-[0.15em] px-8 py-4 hover:bg-[#4f243b] transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? labels.submitting : labels.submit}
      </button>
    </form>
  )
}
