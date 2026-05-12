import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export type NotificationType =
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'new_message'
  | 'job_marked_done'
  | 'payment_released'
  | 'review_received'

export type Channel = 'email' | 'push'

export const NOTIFICATION_TYPES: { value: NotificationType; label: string; description: string }[] = [
  { value: 'new_offer', label: 'New offer', description: 'When a member sends you an offer on your task.' },
  { value: 'offer_accepted', label: 'Offer accepted', description: 'When a customer accepts your offer.' },
  { value: 'offer_rejected', label: 'Offer not chosen', description: 'When the customer picks another member.' },
  { value: 'new_message', label: 'New message', description: 'When someone messages you about a task.' },
  { value: 'job_marked_done', label: 'Job marked complete', description: 'When your member says a job is done.' },
  { value: 'payment_released', label: 'Payment released', description: 'When funds are sent to your account.' },
  { value: 'review_received', label: 'Review received', description: 'When someone leaves you a review.' },
]

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const DEFAULT_PUSH_OFF: Set<NotificationType> = new Set([
  'offer_rejected',
  'payment_released',
  'review_received',
])

export async function shouldNotify(userId: string, channel: Channel, type: NotificationType): Promise<boolean> {
  const supabase = adminClient()
  const column = `${channel}_${type}`
  const { data } = await supabase
    .from('notification_preferences')
    .select(column)
    .eq('user_id', userId)
    .maybeSingle()

  if (data && column in data) {
    return Boolean((data as any)[column])
  }

  // No row — use defaults
  if (channel === 'push' && DEFAULT_PUSH_OFF.has(type)) return false
  return true
}

// ──────────────────────────────────────────────────────────────
// Signed unsubscribe tokens (HMAC-based, no DB lookup needed)
// ──────────────────────────────────────────────────────────────

function secret() {
  const s = process.env.NOTIFICATION_TOKEN_SECRET
  if (s) return s
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NOTIFICATION_TOKEN_SECRET is required in production')
  }
  return 'dev-only-secret'
}

export function signUnsubscribeToken(userId: string, type: NotificationType | 'all'): string {
  const payload = `${userId}.${type}`
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function verifyUnsubscribeToken(token: string): { userId: string; type: NotificationType | 'all' } | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sig] = parts
  let payload: string
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8')
  } catch {
    return null
  }
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const [userId, type] = payload.split('.')
  if (!userId || !type) return null
  return { userId, type: type as NotificationType | 'all' }
}

export async function applyUnsubscribe(userId: string, type: NotificationType | 'all'): Promise<void> {
  const supabase = adminClient()
  if (type === 'all') {
    const allOff: Record<string, boolean> = {}
    for (const t of NOTIFICATION_TYPES) {
      allOff[`email_${t.value}`] = false
      allOff[`push_${t.value}`] = false
    }
    await supabase.from('notification_preferences').upsert({ user_id: userId, ...allOff }, { onConflict: 'user_id' })
  } else {
    await supabase.from('notification_preferences').upsert(
      { user_id: userId, [`email_${type}`]: false },
      { onConflict: 'user_id' },
    )
  }
}
