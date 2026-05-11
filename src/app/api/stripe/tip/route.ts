import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, workerId, amountDollars } = await req.json()

  const amount = Number(amountDollars)
  if (!amount || amount < 1 || amount > 500) {
    return Response.json({ error: 'Invalid tip amount.' }, { status: 400 })
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('title, customer_id')
    .eq('id', taskId)
    .single()

  if (!task || task.customer_id !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: worker } = await supabase
    .from('users')
    .select('stripe_account_id, name')
    .eq('id', workerId)
    .single()

  if (!worker?.stripe_account_id) {
    return Response.json({ error: 'Member has not connected their payment account.' }, { status: 400 })
  }

  const amountCents = Math.round(amount * 100)
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Tip for ${worker.name} — ${task.title}` },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      // No application_fee_amount — 100% goes to the member
      transfer_data: { destination: worker.stripe_account_id },
    },
    mode: 'payment',
    success_url: `${origin}/tasks/${taskId}?tip=sent`,
    cancel_url: `${origin}/tasks/${taskId}`,
  })

  return Response.json({ url: session.url })
}
