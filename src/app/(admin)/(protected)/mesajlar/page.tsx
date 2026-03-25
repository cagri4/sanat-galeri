import { getAllMessages } from '@/lib/queries/admin'
import MessageList from '@/components/admin/message-list'

export default async function MesajlarPage() {
  const messages = await getAllMessages()
  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">
        Mesajlar{' '}
        {unreadCount > 0 && (
          <span className="text-xl text-neutral-500">({unreadCount} okunmamis)</span>
        )}
      </h1>

      <MessageList messages={messages} />
    </div>
  )
}
