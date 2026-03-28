'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markMessageRead } from '@/lib/actions/message'
import { parseProductContext } from '@/lib/utils/message-utils'

interface Artist {
  id: number
  slug: string
  nameTr: string
  nameEn: string
}

interface MessageData {
  id: number
  artistId: number | null
  senderName: string
  senderEmail: string
  body: string
  isRead: boolean | null
  createdAt: Date | null
  artist: Artist | null
}

interface MessageListProps {
  messages: MessageData[]
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default function MessageList({ messages }: MessageListProps) {
  const router = useRouter()
  const [markingId, setMarkingId] = useState<number | null>(null)

  const handleMarkRead = async (id: number) => {
    setMarkingId(id)
    try {
      await markMessageRead(id)
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setMarkingId(null)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-neutral-500">Hic mesaj bulunamadi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isRead = message.isRead ?? false
        const { productSlug, cleanBody } = parseProductContext(message.body)

        return (
          <div
            key={message.id}
            className={`rounded-lg border p-4 transition-colors ${
              isRead
                ? 'border-neutral-200 bg-white'
                : 'border-neutral-300 bg-neutral-50 shadow-sm'
            }`}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm ${isRead ? 'font-normal text-neutral-700' : 'font-semibold text-neutral-900'}`}>
                    {message.senderName}
                  </span>
                  <span className="text-xs text-neutral-500">{message.senderEmail}</span>

                  {/* Unread dot */}
                  {!isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Okunmamış" />
                  )}
                </div>

                {/* Context badges */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {productSlug && (
                    <a
                      href={`/galeri/${productSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                    >
                      Eser: {productSlug}
                    </a>
                  )}
                  {message.artist && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      {message.artist.nameTr}
                    </span>
                  )}
                  {!productSlug && !message.artist && (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                      Genel
                    </span>
                  )}
                </div>
              </div>

              {/* Date + mark read */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs text-neutral-400">
                  {formatDate(message.createdAt)}
                </span>
                {!isRead && (
                  <button
                    onClick={() => handleMarkRead(message.id)}
                    disabled={markingId === message.id}
                    className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 disabled:opacity-50"
                  >
                    {markingId === message.id ? '...' : 'Okundu'}
                  </button>
                )}
              </div>
            </div>

            {/* Message body */}
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isRead ? 'text-neutral-500' : 'text-neutral-700'}`}>
              {cleanBody}
            </p>
          </div>
        )
      })}
    </div>
  )
}
