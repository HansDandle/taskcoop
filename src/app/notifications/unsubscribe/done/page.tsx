import type { Metadata } from 'next'
import Link from 'next/link'
import { NOTIFICATION_TYPES } from '@/lib/notification-prefs'

export const metadata: Metadata = { title: 'Unsubscribed' }

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const matched = NOTIFICATION_TYPES.find(t => t.value === type)
  const label = type === 'all' ? 'all task.coop notifications' : matched ? matched.label.toLowerCase() : 'these emails'

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">📭</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">You've been unsubscribed</h1>
        <p className="text-stone-500 text-sm mb-6">
          You will no longer receive {label} from task.coop. You can change this anytime in your notification preferences.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/profile/notifications"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Manage preferences
          </Link>
          <Link
            href="/"
            className="border border-stone-300 text-stone-700 px-6 py-2.5 rounded-md text-sm font-semibold hover:border-stone-500 transition-colors"
          >
            Back to task.coop
          </Link>
        </div>
      </div>
    </div>
  )
}
