import { createClient as createServiceClient } from '@supabase/supabase-js'
import { stripe } from './stripe'
import { PLATFORM_FEE_PERCENT } from './utils'
import { sendPaymentReleasedEmail } from './email'
import { sendPushToUser } from './push'

// Uses service role — safe for cron, not for user-facing actions
const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function releasePayment(task: {
  id: string
  title: string
  payment_intent_id: string
  payment_status: string
}) {
  await supabase.from('tasks').update({ status: 'completed' }).eq('id', task.id)

  if (task.payment_status !== 'held' || !task.payment_intent_id) return

  const [{ data: offer }, ] = await Promise.all([
    supabase.from('offers').select('amount, worker_id').eq('task_id', task.id).eq('status', 'accepted').single(),
  ])

  if (!offer) return

  const { data: worker } = await supabase.from('users').select('stripe_account_id, email').eq('id', offer.worker_id).single()
  if (!worker?.stripe_account_id) return

  const pi = await stripe.paymentIntents.retrieve(task.payment_intent_id)
  const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id
  if (!chargeId) return

  const workerAmountCents = Math.round(offer.amount * 100 * (1 - PLATFORM_FEE_PERCENT / 100))
  await stripe.transfers.create({
    amount: workerAmountCents,
    currency: 'usd',
    destination: worker.stripe_account_id,
    source_transaction: chargeId,
  })

  await supabase.from('tasks').update({ payment_status: 'released' }).eq('id', task.id)

  if (worker.email) {
    await sendPaymentReleasedEmail(offer.worker_id, worker.email, task.title, offer.amount)
  }
  await sendPushToUser(offer.worker_id, {
    title: 'Payment released 💰',
    body: `$${(offer.amount * 0.95).toFixed(2)} on its way for "${task.title}"`,
    url: '/dashboard',
    tag: `paid-${task.id}`,
    type: 'payment_released',
  })
}
