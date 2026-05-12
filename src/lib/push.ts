import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { shouldNotify, type NotificationType } from './notification-prefs'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:support@taskcoop.org'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

type Payload = {
  title: string
  body: string
  url?: string
  tag?: string
  type: NotificationType
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function sendPushToUser(userId: string, payload: Payload) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return
  if (!(await shouldNotify(userId, 'push', payload.type))) return

  const supabase = adminClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs?.length) return

  const json = JSON.stringify(payload)
  const expired: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json,
        )
      } catch (err: any) {
        // 404/410 means the subscription is gone; clean it up
        if (err.statusCode === 404 || err.statusCode === 410) {
          expired.push(sub.id)
        } else {
          console.error('Push send failed:', err.statusCode, err.body)
        }
      }
    }),
  )

  if (expired.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expired)
  }
}
