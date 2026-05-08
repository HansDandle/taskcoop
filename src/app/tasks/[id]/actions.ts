'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { PLATFORM_FEE_PERCENT } from '@/lib/utils'

export async function submitOffer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const task_id = formData.get('task_id') as string
  const amount = Number(formData.get('amount'))
  const message = (formData.get('message') as string).trim() || null

  if (!task_id || !amount || amount < 5) return { error: 'Invalid offer data.' }

  const { error } = await supabase.from('offers').insert({ task_id, worker_id: user.id, amount, message })
  if (error) return { error: 'Failed to submit offer.' }

  revalidatePath(`/tasks/${task_id}`)
}

// Accept an offer → charge the customer immediately (funds held in escrow on platform)
export async function acceptOffer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const offer_id = formData.get('offer_id') as string
  const task_id = formData.get('task_id') as string

  const { data: task } = await supabase
    .from('tasks')
    .select('customer_id, status, title')
    .eq('id', task_id)
    .single()

  if (!task || task.customer_id !== user.id) return { error: 'Not authorized.' }
  if (task.status !== 'open') return { error: 'Task is no longer open.' }

  const { data: offer } = await supabase
    .from('offers')
    .select('id, amount, worker_id')
    .eq('id', offer_id)
    .single()

  if (!offer) return { error: 'Offer not found.' }

  // Mark offer accepted, reject others
  await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer_id)
  await supabase.from('offers').update({ status: 'rejected' }).eq('task_id', task_id).neq('id', offer_id)
  await supabase.from('tasks').update({ status: 'assigned' }).eq('id', task_id)

  // Create Stripe Checkout — funds held on platform (no transfer_data = separate charges model)
  const amountCents = Math.round(offer.amount * 100)
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: task.title },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${origin}/tasks/${task_id}?payment=success`,
    cancel_url: `${origin}/tasks/${task_id}`,
    metadata: {
      task_id,
      offer_id,
      worker_id: offer.worker_id,
      amount: offer.amount.toString(),
    },
  })

  redirect(session.url!)
}

export async function updateTaskStatus(newStatus: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const task_id = formData.get('task_id') as string
  const { data: task } = await supabase.from('tasks').select('customer_id').eq('id', task_id).single()
  if (!task || task.customer_id !== user.id) return { error: 'Not authorized.' }

  await supabase.from('tasks').update({ status: newStatus }).eq('id', task_id)
  revalidatePath(`/tasks/${task_id}`)
}

export async function cancelTask(formData: FormData) {
  return updateTaskStatus('cancelled', formData)
}

// Release funds to worker — called when customer marks complete or auto-release fires
export async function releaseFunds(task_id: string) {
  const supabase = await createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('payment_intent_id, payment_status')
    .eq('id', task_id)
    .single()

  if (!task || task.payment_status !== 'held' || !task.payment_intent_id) return

  const { data: offer } = await supabase
    .from('offers')
    .select('amount, worker_id')
    .eq('task_id', task_id)
    .eq('status', 'accepted')
    .single()

  if (!offer) return

  const { data: worker } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', offer.worker_id)
    .single()

  if (!worker?.stripe_account_id) return

  // Retrieve the charge from the payment intent
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

  await supabase
    .from('tasks')
    .update({ payment_status: 'released', status: 'completed' })
    .eq('id', task_id)

  revalidatePath(`/tasks/${task_id}`)
}
