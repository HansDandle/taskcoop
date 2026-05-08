'use client'

import { useState, useTransition } from 'react'
import { StarRatingInput } from '@/components/star-rating'
import { submitReview } from './actions'
import { useRouter } from 'next/navigation'

export default function ReviewForm({
  taskId,
  revieweeId,
  revieweeName,
}: {
  taskId: string
  revieweeId: string
  revieweeName: string
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    setError('')
    const fd = new FormData()
    fd.set('task_id', taskId)
    fd.set('reviewee_id', revieweeId)
    fd.set('rating', String(rating))
    fd.set('comment', comment)
    startTransition(async () => {
      const res = await submitReview(fd)
      if (res?.error) setError(res.error)
      else router.push(`/tasks/${taskId}`)
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
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}
