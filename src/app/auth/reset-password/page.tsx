'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setIsPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setIsPending(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-1">task<span className="text-emerald-600">.coop</span></div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Set a new password</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">New password</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-stone-700">Confirm password</label>
            <input id="confirm" type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

          <button type="submit" disabled={isPending} className="flex w-full justify-center rounded-md bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60">
            {isPending ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  )
}
