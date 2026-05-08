import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Check your email' }

export default function SignupConfirmedPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6 rounded-xl border border-stone-200 bg-white p-10 shadow-sm">
        <div className="text-4xl">✉️</div>
        <div>
          <div className="text-2xl font-semibold mb-1">task<span className="text-emerald-600">.coop</span></div>
          <h1 className="text-xl font-bold text-stone-900 mt-4">Check your email</h1>
          <p className="mt-2 text-stone-500 text-sm leading-relaxed">
            We sent you a confirmation link. Click it to activate your account and get started.
          </p>
        </div>
        <p className="text-xs text-stone-400">
          Didn't get it? Check your spam folder or{' '}
          <Link href="/signup" className="text-emerald-600 hover:underline">try again</Link>.
        </p>
      </div>
    </div>
  )
}
