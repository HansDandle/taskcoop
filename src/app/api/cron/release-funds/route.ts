import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { releasePayment } from '@/lib/release-funds'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, payment_intent_id, payment_status')
    .eq('payment_status', 'held')
    .lt('funds_release_at', new Date().toISOString())

  if (error) return new Response('DB error', { status: 500 })
  if (!tasks?.length) return new Response(JSON.stringify({ released: 0 }), { status: 200 })

  await Promise.all(tasks.map(t => releasePayment(t as any)))

  return new Response(JSON.stringify({ released: tasks.length }), { status: 200 })
}
