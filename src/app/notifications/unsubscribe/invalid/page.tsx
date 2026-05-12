import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Invalid unsubscribe link' }

export default function InvalidUnsubscribePage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">This link isn't valid</h1>
        <p className="text-stone-500 text-sm mb-6">
          The unsubscribe link is malformed or expired. You can still manage your notification preferences from your profile.
        </p>
        <Link
          href="/profile/notifications"
          className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Manage preferences
        </Link>
      </div>
    </div>
  )
}
