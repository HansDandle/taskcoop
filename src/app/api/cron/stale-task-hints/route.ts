import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendStaleTaskHintEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const cutoff = new Date(Date.now() - THREE_DAYS_MS).toISOString()

  // Open, customer-posted tasks older than 3 days that haven't been nudged yet
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, description, budget, customer_id')
    .eq('status', 'open')
    .eq('source', 'direct')
    .is('hint_email_sent_at', null)
    .lt('created_at', cutoff)

  if (error) return new Response('DB error', { status: 500 })
  if (!tasks?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 })

  const ids = tasks.map(t => t.id)

  // Tasks that already have a live offer should be left alone
  const { data: offers } = await supabase
    .from('offers')
    .select('task_id')
    .in('task_id', ids)
    .neq('status', 'withdrawn')
  const hasOffer = new Set((offers ?? []).map(o => o.task_id))

  // Tasks that already have photos
  const { data: images } = await supabase
    .from('task_images')
    .select('task_id')
    .in('task_id', ids)
  const hasImage = new Set((images ?? []).map(i => i.task_id))

  let sent = 0
  for (const t of tasks) {
    if (hasOffer.has(t.id)) continue
    if (!t.customer_id) continue

    // Email lives in auth.users, not public.users — resolve via the admin API
    const { data: authUser } = await supabase.auth.admin.getUserById(t.customer_id)
    const email = authUser.user?.email
    if (!email) continue

    const hints: string[] = []
    if (t.budget == null || Number(t.budget) <= 0) {
      hints.push('Set a budget so members know what the job is worth to you.')
    }
    if (!hasImage.has(t.id)) {
      hints.push('Add a few photos so members can get a sense of the scope.')
    }
    if (!t.description || t.description.trim().length < 80) {
      hints.push('Add more detail about the work so members can give an accurate offer.')
    }

    await sendStaleTaskHintEmail(t.customer_id, email, t.title, t.id, hints)
    await supabase
      .from('tasks')
      .update({ hint_email_sent_at: new Date().toISOString() })
      .eq('id', t.id)
    sent++
  }

  return new Response(JSON.stringify({ sent }), { status: 200 })
}
