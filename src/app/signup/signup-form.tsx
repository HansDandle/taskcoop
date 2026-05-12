'use client'

import { useState } from 'react'
import { signup } from '@/app/auth/actions'

function scorePassword(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['bg-stone-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600']

export default function SignupForm({ role, ref: refCode }: { role?: string; ref?: string }) {
  const [password, setPassword] = useState('')
  const strength = scorePassword(password)

  return (
    <form className="space-y-5" action={signup}>
      {refCode && <input type="hidden" name="ref" value={refCode} />}
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-stone-700">Full name</label>
          <input id="full_name" name="full_name" type="text" required autoComplete="name"
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email"
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
          />
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded ${i < strength ? STRENGTH_COLOR[strength] : 'bg-stone-200'}`} />
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-1">{STRENGTH_LABEL[strength]}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">I want to…</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center gap-2 border border-stone-300 rounded-lg p-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
              <input type="radio" name="role" value="customer" defaultChecked={role !== 'worker'} className="sr-only" />
              <span className="text-2xl">📋</span>
              <span className="text-sm font-medium text-stone-800">Post Tasks</span>
              <span className="text-xs text-stone-500 text-center">Find local members</span>
            </label>
            <label className="flex flex-col items-center gap-2 border border-stone-300 rounded-lg p-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
              <input type="radio" name="role" value="worker" defaultChecked={role === 'worker'} className="sr-only" />
              <span className="text-2xl">🔨</span>
              <span className="text-sm font-medium text-stone-800">Work & Earn</span>
              <span className="text-xs text-stone-500 text-center">Keep 95% of every job</span>
            </label>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-stone-600 cursor-pointer">
        <input type="checkbox" name="agreed_to_terms" required className="mt-0.5 shrink-0" />
        <span>I agree to the <a href="/terms" className="underline hover:text-stone-900">Terms of Service</a> and <a href="/privacy" className="underline hover:text-stone-900">Privacy Policy</a></span>
      </label>

      <button type="submit" className="flex w-full justify-center rounded-md bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none transition-colors">
        Create account
      </button>
    </form>
  )
}
