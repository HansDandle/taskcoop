'use client'

import { useState, useTransition } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function PayButton({ offerId, amount }: { offerId: string; amount: number }) {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handlePay = () => {
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (data.url) {
        window.location.href = data.url
      }
    })
  }

  return (
    <div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <button
        onClick={handlePay}
        disabled={isPending}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {isPending ? 'Redirecting…' : `Pay ${formatCurrency(amount)}`}
      </button>
      <p className="text-xs text-stone-400 text-center mt-2">Secure payment via Stripe</p>
    </div>
  )
}
