'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { send } from '@/lib/email'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: role } = await supabase.rpc('get_my_role')
  return role === 'admin'
}

export interface BlastFilters {
  role: 'all' | 'customer' | 'worker'
  idVerified: 'all' | 'yes' | 'no'
  stripeOnboarded: 'all' | 'yes' | 'no'
  inactiveDays: '' | '30' | '60' | '90' | '180'
}

function buildQuery(filters: BlastFilters) {
  let q = serviceClient()
    .from('admin_users_view')
    .select('id, name, email, last_sign_in_at')
    .neq('role', 'admin')

  if (filters.role !== 'all') q = q.eq('role', filters.role)
  if (filters.idVerified === 'yes') q = q.eq('id_verified', true)
  if (filters.idVerified === 'no') q = q.eq('id_verified', false)
  if (filters.stripeOnboarded === 'yes') q = q.eq('stripe_onboarded', true)
  if (filters.stripeOnboarded === 'no') q = q.eq('stripe_onboarded', false)
  if (filters.inactiveDays) {
    const cutoff = new Date(Date.now() - parseInt(filters.inactiveDays) * 24 * 60 * 60 * 1000).toISOString()
    q = q.or(`last_sign_in_at.lt.${cutoff},last_sign_in_at.is.null`)
  }

  return q
}

export async function previewRecipients(filters: BlastFilters): Promise<{ id: string; name: string; email: string }[]> {
  if (!await requireAdmin()) return []
  const { data } = await buildQuery(filters).limit(500)
  return (data ?? []).map(u => ({ id: u.id, name: u.name, email: u.email }))
}

export async function sendBlast(filters: BlastFilters, subject: string, body: string): Promise<{ sent: number; error?: string }> {
  if (!await requireAdmin()) return { sent: 0, error: 'Not authorized.' }
  if (!subject.trim() || !body.trim()) return { sent: 0, error: 'Subject and body are required.' }

  const { data } = await buildQuery(filters).limit(500)
  if (!data?.length) return { sent: 0, error: 'No recipients match these filters.' }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden">
    <div style="padding:20px 24px;border-bottom:1px solid #e7e5e4">
      <span style="font-size:18px;font-weight:600;color:#1c1917">task<span style="color:#16a34a">.coop</span></span>
    </div>
    <div style="padding:24px;font-size:15px;color:#44403c;line-height:1.6;white-space:pre-wrap">${body}</div>
    <div style="padding:16px 24px;border-top:1px solid #e7e5e4;font-size:12px;color:#a8a29e">Member-owned local services marketplace · Austin, TX</div>
  </div>
</body>
</html>`

  let sent = 0
  for (const user of data) {
    if (!user.email) continue
    await send(user.email, subject, html)
    sent++
  }

  return { sent }
}
