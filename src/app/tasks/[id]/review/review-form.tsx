'use client'

import { useState, useTransition } from 'react'
import { StarRatingInput } from '@/components/star-rating'
import { submitReview } from './actions'
import { useRouter } from 'next/navigation'

const TIP_PERCENTS = [10, 20, 30]

export default function ReviewForm({
  taskId,
  revieweeId,
  revieweeName,
  isCustomer,
  workerStripeReady,
  jobAmount,
}: {
  taskId: string
  revieweeId: string
  revieweeName: string
  isCustomer?: boolean
  workerStripeReady?: boolean
  jobAmount?: number | null
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [tipAmount, setTipAmount] = useState<number | null>(null)
  const [customTip, setCustomTip] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const resolvedTip = tipAmount ?? (customTip ? Number(customTip) : null)

  const handleSubmit = () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    if (customTip && (isNaN(Number(customTip)) || Number(customTip) < 1)) {
      setError('Please enter a valid tip amount.')
      return
    }
    setError('')
    const fd = new FormData()
    fd.set('task_id', taskId)
    fd.set('reviewee_id', revieweeId)
    fd.set('rating', String(rating))
    fd.set('comment', comment)
    startTransition(async () => {
      const res = await submitReview(fd)
      if (res?.error) { setError(res.error); return }

      if (resolvedTip && resolvedTip >= 1) {
        const tipRes = await fetch('/api/stripe/tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, workerId: revieweeId, amountDollars: resolvedTip }),
        })
        const tipData = await tipRes.json()
        if (tipData.url) {
          window.location.href = tipData.url
          return
        }
      }

      router.push(`/tasks/${taskId}`)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={`Share your experience working with ${revieweeName}…`}
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {isCustomer && workerStripeReady && (
        <div className="border border-stone-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm font-medium text-stone-700">Leave a tip</div>
            <div className="text-sm text-stone-500 mt-0.5">Optional, not expected. Member gets 100% of tips (minus CC fee — cash preferred).</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {jobAmount && TIP_PERCENTS.map(pct => {
              const amount = Math.round(jobAmount * pct) / 100
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => { setTipAmount(tipAmount === amount ? null : amount); setCustomTip('') }}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    tipAmount === amount
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-400'
                  }`}
                >
                  {pct}% <span className="opacity-70">(${amount.toFixed(2)})</span>
                </button>
              )
            })}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input
                type="number"
                min="1"
                max="500"
                placeholder="Other"
                value={customTip}
                onChange={(e) => { setCustomTip(e.target.value); setTipAmount(null) }}
                className="pl-6 pr-3 py-2 w-24 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          {resolvedTip && resolvedTip >= 1 && (
            <p className="text-xs text-emerald-700">${resolvedTip} tip will be added — you'll complete it on the next screen.</p>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {isPending ? 'Submitting…' : resolvedTip && resolvedTip >= 1 ? `Submit Review & Tip $${resolvedTip}` : 'Submit Review'}
      </button>
    </div>
  )
}
