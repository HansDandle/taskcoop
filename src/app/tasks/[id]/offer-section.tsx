'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { submitOffer, acceptOffer } from './actions'

type Offer = {
  id: string
  amount: number
  message: string | null
  status: string
  created_at: string
  users: { id: string; name: string; avatar_url: string | null; bio: string | null } | null
}

export default function OfferSection({
  task,
  offers,
  isOwner,
  isWorker,
  hasOffered,
  currentUserId,
  stripeReady,
}: {
  task: { id: string; status: string; customer_id: string }
  offers: Offer[]
  isOwner: boolean
  isWorker: boolean
  hasOffered: boolean
  currentUserId: string | null
  stripeReady: boolean
}) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleOffer = () => {
    if (!amount || Number(amount) < 5) { setError('Please enter a valid amount (minimum $5).'); return }
    setError('')
    const fd = new FormData()
    fd.set('task_id', task.id)
    fd.set('amount', amount)
    fd.set('message', message)
    startTransition(async () => {
      const res = await submitOffer(fd)
      if (res?.error) setError(res.error)
    })
  }

  const handleAccept = (offerId: string) => {
    const fd = new FormData()
    fd.set('offer_id', offerId)
    fd.set('task_id', task.id)
    startTransition(async () => {
      const res = await acceptOffer(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-stone-900">Offers ({offers.length})</h2>

      {offers.length === 0 && (
        <div className="text-sm text-stone-400 py-4">No offers yet.</div>
      )}

      {offers.map((offer) => {
        const worker = offer.users
        const isAccepted = offer.status === 'accepted'
        return (
          <div
            key={offer.id}
            className={`bg-white border rounded-lg p-4 ${isAccepted ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {worker?.avatar_url ? (
                  <img src={worker.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600">
                    {worker?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <Link href={`/workers/${worker?.id}`} className="font-medium text-stone-900 hover:underline text-sm">
                    {worker?.name}
                  </Link>
                  <div className="text-xs text-stone-400">{formatRelativeDate(offer.created_at)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-stone-900">{formatCurrency(offer.amount)}</div>
                {isAccepted && <div className="text-xs text-emerald-600 font-medium">Accepted</div>}
              </div>
            </div>
            {offer.message && (
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">{offer.message}</p>
            )}
            <div className="mt-3 flex gap-3">
              {currentUserId && (
                <Link
                  href={`/messages/${task.id}?worker=${worker?.id}`}
                  className="text-xs text-stone-500 hover:text-stone-700 underline"
                >
                  Message
                </Link>
              )}
              {isOwner && task.status === 'open' && offer.status === 'pending' && (
                <button
                  onClick={() => handleAccept(offer.id)}
                  disabled={isPending}
                  className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  Accept offer
                </button>
              )}
            </div>
          </div>
        )
      })}

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

      {/* Stripe Connect gate */}
      {isWorker && task.status === 'open' && !hasOffered && !stripeReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Connect your bank account to submit offers</p>
          <p className="text-xs text-amber-700 mb-3">task.coop uses Stripe to pay members securely. It only takes a few minutes.</p>
          <Link
            href="/api/stripe/connect"
            className="inline-block text-sm bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors font-medium"
          >
            Set up payouts →
          </Link>
        </div>
      )}

      {/* Submit offer form for members */}
      {isWorker && task.status === 'open' && !hasOffered && stripeReady && (
        <div className="bg-white border border-stone-200 rounded-lg p-5 mt-4">
          <h3 className="font-semibold text-stone-900 mb-4">Submit an offer</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Your price ($)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150"
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Message (optional)</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the customer about your experience and approach…"
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleOffer}
              disabled={isPending}
              className="w-full bg-emerald-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {isPending ? 'Submitting…' : 'Submit Offer'}
            </button>
          </div>
        </div>
      )}

      {isWorker && hasOffered && task.status === 'open' && (
        <div className="text-sm text-stone-400 py-2">You&apos;ve submitted an offer on this task.</div>
      )}

      {!currentUserId && task.status === 'open' && (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-center">
          <p className="text-sm text-stone-600 mb-3">Sign in to submit an offer or message the customer.</p>
          <Link href="/login" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
            Sign in
          </Link>
        </div>
      )}
    </div>
  )
}
