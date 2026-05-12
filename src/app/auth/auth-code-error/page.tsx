import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Confirmation link expired' }

export default function AuthCodeErrorPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">This link has expired</h1>
        <p className="text-stone-500 text-sm mb-6">
          The confirmation link is no longer valid. This usually happens if the link is more than 24 hours old or
          has already been used. Sign in to continue, or sign up again if you haven't confirmed your account yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="border border-stone-300 text-stone-700 px-6 py-2.5 rounded-md text-sm font-semibold hover:border-stone-500 transition-colors"
          >
            Sign up again
          </Link>
        </div>
      </div>
    </div>
  )
}
