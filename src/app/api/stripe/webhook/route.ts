import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { task_id } = session.metadata ?? {}
    const payment_intent_id = session.payment_intent

    if (task_id && payment_intent_id) {
      const funds_release_at = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('tasks')
        .update({ payment_intent_id, payment_status: 'held', funds_release_at, status: 'assigned' })
        .eq('id', task_id)
    }
  }

  if (event.type === 'account.updated') {
    const account = event.data.object as any
    if (account.charges_enabled) {
      await supabase
        .from('users')
        .update({ stripe_onboarded: true })
        .eq('stripe_account_id', account.id)
    }
  }

  return new Response('ok', { status: 200 })
}
