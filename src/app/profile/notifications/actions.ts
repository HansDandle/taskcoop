'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { NOTIFICATION_TYPES } from '@/lib/notification-prefs'

const VALID_KEYS = new Set([
  ...NOTIFICATION_TYPES.map(t => `email_${t.value}`),
  ...NOTIFICATION_TYPES.map(t => `push_${t.value}`),
])

export async function savePreferences(prefs: Record<string, boolean>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const clean: Record<string, boolean | string> = { user_id: user.id }
  for (const [key, value] of Object.entries(prefs)) {
    if (VALID_KEYS.has(key)) clean[key] = Boolean(value)
  }

  await supabase
    .from('notification_preferences')
    .upsert(clean, { onConflict: 'user_id' })

  revalidatePath('/profile/notifications')
  return { ok: true }
}
