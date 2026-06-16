'use client'

import { useState, useTransition } from 'react'
import { resendConfirmation } from '@/app/auth/actions'

export default function ResendButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!email) return null

  return (
    <div className="text-xs text-stone-400">
      Didn&apos;t get it? Check your spam folder, or{' '}
      <button
        type="button"
        disabled={isPending || sent}
        onClick={() => {
          setError('')
          startTransition(async () => {
            const res = await resendConfirmation(email)
            if (res.error) setError(res.error)
            else setSent(true)
          })
        }}
        className="text-emerald-600 hover:underline disabled:opacity-60 disabled:no-underline"
      >
        {isPending ? 'sending…' : sent ? 'sent!' : 'resend the email'}
      </button>
      .
      {sent && <p className="mt-1 text-emerald-600">Sent again to {email}.</p>}
      {error && <p className="mt-1 text-red-600">{error}</p>}
    </div>
  )
}
