import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { PLATFORM_FEE_PERCENT } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { offerId } = await req.json()

  const { data: offer } = await supabase
    .from('offers')
    .select('id, amount, task_id, worker_id, status, tasks(title, customer_id)')
    .eq('id', offerId)
    .single()

  if (!offer || offer.status !== 'accepted') {
    return Response.json({ error: 'Invalid offer' }, { status: 400 })
  }

  const task = offer.tasks as any
  if (task?.customer_id !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: workerProfile } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', offer.worker_id)
    .single()

  if (!workerProfile?.stripe_account_id) {
    return Response.json({ error: 'Worker has not connected their payment account.' }, { status: 400 })
  }

  const amountCents = Math.round(offer.amount * 100)
  const feeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100)
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: task?.title ?? 'Task payment' },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: feeCents,
      transfer_data: { destination: workerProfile.stripe_account_id },
    },
    mode: 'payment',
    success_url: `${origin}/tasks/${offer.task_id}?payment=success`,
    cancel_url: `${origin}/tasks/${offer.task_id}`,
    metadata: { offer_id: offerId, task_id: offer.task_id },
  })

  return Response.json({ url: session.url })
}
