'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { setError(error.message); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md text-center rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="text-2xl font-semibold mb-4">task<span className="text-emerald-600">.coop</span></div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Check your email</h2>
          <p className="text-sm text-stone-500">We sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.</p>
          <Link href="/login" className="mt-6 inline-block text-sm text-emerald-600 hover:underline">Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-1">task<span className="text-emerald-600">.coop</span></div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Reset your password</h2>
          <p className="mt-1 text-sm text-stone-500">We'll send you a link to reset it.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

          <button type="submit" className="flex w-full justify-center rounded-md bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
            Send reset link
          </button>
        </form>

        <p className="text-center text-sm text-stone-500">
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
