'use client'

import { useState } from 'react'
import { createSourcedTask } from './actions'
import { APP_URL } from '@/lib/urls'

type Post = {
  id: string
  title: string
  body: string
  neighborhood: string
  externalUrl: string
  category: string
}

type Profile = {
  name: string
  bio: string | null
  id_verified: boolean
}

export default function NextdoorOfferForm({
  post,
  profile,
}: {
  post: Post
  profile: Profile
}) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const bioExcerpt = profile.bio
    ? profile.bio.slice(0, 120) + (profile.bio.length > 120 ? '…' : '')
    : 'a verified TaskCoop member'

  const taskUrl = taskId ? `${APP_URL}/tasks/${taskId}` : ''

  const replyText = taskId
    ? `Book me: ${taskUrl}\n\nI'm ${bioExcerpt} and I'll do it for $${amount}. Payment is escrowed — you pay nothing until you mark the job complete.${profile.id_verified ? ' My ID is also verified by TaskCoop.' : ''}`
    : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await createSourcedTask({
      title: post.title,
      body: post.body,
      externalId: post.id,
      externalUrl: post.externalUrl,
      neighborhood: post.neighborhood,
      amount: Number(amount),
      message: message.trim() || undefined,
    })

    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setTaskId(result.taskId)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(replyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (taskId) {
    return (
      <div className="mt-4 border border-emerald-200 rounded-lg bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-900 mb-3">Your reply is ready — copy and paste it to Nextdoor</p>
        <div className="bg-white border border-emerald-200 rounded-md p-3 text-sm text-stone-700 whitespace-pre-wrap font-mono leading-relaxed">
          {replyText}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleCopy}
            className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy reply'}
          </button>
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-700 hover:underline"
          >
            Open post on Nextdoor →
          </a>
        </div>
        <p className="text-xs text-stone-500 mt-3">
          When they click your link, they&apos;ll see your offer and can book you directly through TaskCoop.
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors"
      >
        Offer to help
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border border-stone-200 rounded-lg p-4 bg-stone-50 space-y-3">
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1">
          Your price ($)
        </label>
        <input
          type="number"
          min="5"
          step="1"
          required
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="e.g. 60"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1">
          Note to requester <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Any details about your experience or availability…"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating offer…' : 'Generate reply'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
