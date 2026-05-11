'use client'

import { useState, useTransition } from 'react'
import { submitContact } from './actions'

const CATEGORIES = [
  'General question',
  'I need help with a task',
  'I need help with payment',
  'Membership inquiry',
  'Report a problem',
  'Dispute or complaint',
  'Other',
]

export default function ContactForm({ defaultEmail }: { defaultEmail?: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await submitContact(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setDone(true)
      }
    })
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
        <p className="text-lg font-semibold text-emerald-900 mb-1">Message sent</p>
        <p className="text-sm text-emerald-700">We'll get back to you at the email you provided, usually within one business day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Your email</label>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@example.com"
          className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
        <select
          name="category"
          required
          className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Subject</label>
        <input
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="Brief summary of your question"
          className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Message</label>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={4000}
          placeholder="Describe your question or issue in as much detail as you can."
          className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {isPending ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}
