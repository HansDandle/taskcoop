import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NOTIFICATION_TYPES } from '@/lib/notification-prefs'
import NotificationForm from './notification-form'

export const metadata: Metadata = { title: 'Notification preferences' }

export default async function NotificationPrefsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile/notifications')

  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Build effective values (use defaults when no row exists)
  const effective: Record<string, boolean> = {}
  for (const t of NOTIFICATION_TYPES) {
    const emailKey = `email_${t.value}`
    const pushKey = `push_${t.value}`
    effective[emailKey] = prefs?.[emailKey] ?? true
    const pushDefaultOff = ['offer_rejected', 'payment_released', 'review_received'].includes(t.value)
    effective[pushKey] = prefs?.[pushKey] ?? !pushDefaultOff
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="text-sm text-stone-500 hover:text-stone-700">← Profile</Link>
        <h1 className="text-2xl font-bold text-stone-900">Notification preferences</h1>
      </div>

      <p className="text-stone-500 text-sm mb-6">Choose which alerts you want to receive and how.</p>

      <NotificationForm initial={effective} />
    </div>
  )
}
