'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { sendMessage } from './actions'
import { formatRelativeDate } from '@/lib/utils'

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
}

export default function MessageThread({
  messages: initial,
  currentUserId,
  taskId,
  receiverId,
}: {
  messages: Message[]
  currentUserId: string
  taskId: string
  receiverId: string
}) {
  const [messages, setMessages] = useState(initial)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = content.trim()
    if (!text) return
    setError('')
    const fd = new FormData()
    fd.set('task_id', taskId)
    fd.set('receiver_id', receiverId)
    fd.set('content', text)
    setContent('')
    startTransition(async () => {
      const res = await sendMessage(fd)
      if (res?.error) {
        setError(res.error)
        setContent(text)
      } else if (res?.message) {
        setMessages(prev => [...prev, res.message as Message])
      }
    })
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-64">
        {messages.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 text-sm ${isMine ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-800'}`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-emerald-200' : 'text-stone-400'}`}>{formatRelativeDate(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {error && <div className="px-5 text-xs text-red-600">{error}</div>}
      <div className="px-5 py-4 border-t border-stone-200 flex flex-col sm:flex-row gap-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Type a message…"
          className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !content.trim()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </>
  )
}
