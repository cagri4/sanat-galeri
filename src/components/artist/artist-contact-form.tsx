'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { artistContactSchema, submitArtistContact } from '@/lib/actions/contact'

type ArtistContactFormData = z.infer<typeof artistContactSchema>

interface ArtistContactFormProps {
  artistSlug: string
}

export default function ArtistContactForm({ artistSlug }: ArtistContactFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations('contact')
  const tCv = useTranslations('cv')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtistContactFormData>({
    resolver: zodResolver(artistContactSchema),
    defaultValues: { artistSlug },
  })

  const onSubmit = async (data: ArtistContactFormData) => {
    setIsSubmitting(true)
    try {
      const result = await submitArtistContact(data)
      if (result.success) {
        setIsSuccess(true)
      }
    } catch {
      // Server action failed; keep form open for retry
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-green-800">
        <p className="font-medium">{t('successMessage')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('nameLabel')}
        </label>
        <input
          id="senderName"
          type="text"
          {...register('senderName')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          placeholder={t('namePlaceholder')}
        />
        {errors.senderName && (
          <p className="mt-1 text-sm text-red-600">{errors.senderName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
          {t('emailLabel')}
        </label>
        <input
          id="senderEmail"
          type="email"
          {...register('senderEmail')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          placeholder={t('emailPlaceholder')}
        />
        {errors.senderEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.senderEmail.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          {t('messageLabel')}
        </label>
        <textarea
          id="body"
          rows={5}
          {...register('body')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
          placeholder={tCv('contactPlaceholder')}
        />
        {errors.body && (
          <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
        )}
      </div>

      <input type="hidden" {...register('artistSlug')} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-gray-900 text-white py-3 px-6 text-sm font-medium hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  )
}
