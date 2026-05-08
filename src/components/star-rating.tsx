'use client'

export function StarRating({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'text-xl' : 'text-sm'
  return (
    <span className={`${sz} leading-none`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-amber-400' : 'text-stone-300'}>★</span>
      ))}
    </span>
  )
}

export function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-3xl leading-none transition-colors ${star <= value ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
