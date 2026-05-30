'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/urls'
import { sendNewOfferEmail, sendOfferAcceptedEmail, sendOfferRejectedEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'
import { releasePayment } from '@/lib/release-funds'

export async function submitOffer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const task_id = formData.get('task_id') as string
  const amount = Number(formData.get('amount'))
  const message = (formData.get('message') as string).trim() || null

  if (!task_id || !amount || amount < 5) return { error: 'Invalid offer data.' }

  const [{ data: profile }, { data: targetTask }] = await Promise.all([
    supabase.from('users').select('id_verified, role').eq('id', user.id).single(),
    supabase.from('tasks').select('require_id_verified').eq('id', task_id).single(),
  ])
  if (profile?.role === 'worker' && targetTask?.require_id_verified && !profile?.id_verified) {
    return { error: 'This task requires a verified ID. Upload yours on your profile page.' }
  }

  const { error } = await supabase.from('offers').insert({ task_id, worker_id: user.id, amount, message })
  if (error) return { error: 'Failed to submit offer.' }

  // Notify customer
  const { data: task } = await supabase.from('tasks').select('title, customer_id').eq('id', task_id).single()
  const { data: customer } = task ? await supabase.from('users').select('email').eq('id', task.customer_id).single() : { data: null }
  const { data: member } = await supabase.from('users').select('name').eq('id', user.id).single()
  if (customer?.email && task && member) {
    await sendNewOfferEmail(task.customer_id, customer.email, task.title, task_id, member.name, amount)
  }
  if (task) {
    await sendPushToUser(task.customer_id, {
      title: `New offer: $${amount}`,
      body: `${member?.name ?? 'A member'} sent an offer on "${task.title}"`,
      url: `/tasks/${task_id}`,
      tag: `offer-${task_id}`,
      type: 'new_offer',
    })
  }

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

  // Fetch rejected offers before updating so we can email them
  const { data: otherOffers } = await supabase
    .from('offers')
    .select('worker_id, users!worker_id(id, email)')
    .eq('task_id', task_id)
    .neq('id', offer_id)
    .eq('status', 'pending')

  // Mark offer accepted, reject others
  await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer_id)
  await supabase.from('offers').update({ status: 'rejected' }).eq('task_id', task_id).neq('id', offer_id)
  await supabase.from('tasks').update({ status: 'assigned' }).eq('id', task_id)

  // Notify accepted member
  const { data: acceptedWorker } = await supabase.from('users').select('email').eq('id', offer.worker_id).single()
  if (acceptedWorker?.email) {
    await sendOfferAcceptedEmail(offer.worker_id, acceptedWorker.email, task.title, task_id, offer.amount)
  }
  await sendPushToUser(offer.worker_id, {
    title: 'Your offer was accepted',
    body: `"${task.title}" — $${offer.amount}`,
    url: `/tasks/${task_id}`,
    tag: `accepted-${task_id}`,
    type: 'offer_accepted',
  })

  // Notify rejected members
  for (const o of otherOffers ?? []) {
    const email = (o.users as any)?.email
    if (email) await sendOfferRejectedEmail(o.worker_id, email, task.title)
    await sendPushToUser(o.worker_id, {
      title: 'Another offer was selected',
      body: `The customer chose another member for "${task.title}"`,
      url: '/tasks',
      tag: `rejected-${task_id}-${o.worker_id}`,
      type: 'offer_rejected',
    })
  }

  // Create Stripe Checkout — funds held on platform (no transfer_data = separate charges model)
  const amountCents = Math.round(offer.amount * 100)

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
    success_url: `${APP_URL}/tasks/${task_id}?payment=success`,
    cancel_url: `${APP_URL}/tasks/${task_id}`,
    metadata: {
      task_id,
      offer_id,
      worker_id: offer.worker_id,
      amount: offer.amount.toString(),
    },
  })

  redirect(session.url!)
}

export async function workerMarkDone(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const task_id = formData.get('task_id') as string
  const completion_photos = JSON.parse((formData.get('completion_photos') as string) || '[]')

  // Verify caller is the accepted worker
  const { data: offer } = await supabase
    .from('offers')
    .select('worker_id')
    .eq('task_id', task_id)
    .eq('status', 'accepted')
    .single()

  if (!offer || offer.worker_id !== user.id) return { error: 'Not authorized.' }

  await supabase
    .from('tasks')
    .update({ worker_marked_done: true, completion_photos, status: 'in_progress' })
    .eq('id', task_id)

  // Notify customer
  const { data: task } = await supabase.from('tasks').select('title, customer_id').eq('id', task_id).single()
  const { data: customer } = task ? await supabase.from('users').select('email').eq('id', task.customer_id).single() : { data: null }
  const { data: member } = await supabase.from('users').select('name').eq('id', user.id).single()
  if (customer?.email && task && member) {
    const { sendWorkerMarkedDoneEmail } = await import('@/lib/email')
    await sendWorkerMarkedDoneEmail(task.customer_id, customer.email, member.name, task.title, task_id)
  }
  if (task) {
    await sendPushToUser(task.customer_id, {
      title: 'Job marked complete',
      body: `${member?.name ?? 'Your member'} marked "${task.title}" as done. Review and release payment.`,
      url: `/tasks/${task_id}`,
      tag: `done-${task_id}`,
      type: 'job_marked_done',
    })
  }

  revalidatePath(`/tasks/${task_id}`)
}

export async function workerUpdateStatus(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const task_id = formData.get('task_id') as string
  const status = formData.get('status') as string

  const { data: offer } = await supabase
    .from('offers')
    .select('worker_id')
    .eq('task_id', task_id)
    .eq('status', 'accepted')
    .single()

  if (!offer || offer.worker_id !== user.id) return { error: 'Not authorized.' }

  await supabase.from('tasks').update({ status }).eq('id', task_id)
  revalidatePath(`/tasks/${task_id}`)
}

export async function retractOffer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const offer_id = formData.get('offer_id') as string
  const task_id = formData.get('task_id') as string

  const { data: offer } = await supabase
    .from('offers')
    .select('worker_id, status')
    .eq('id', offer_id)
    .single()

  if (!offer || offer.worker_id !== user.id) return { error: 'Not authorized.' }
  if (offer.status !== 'pending') return { error: 'Only pending offers can be retracted.' }

  await supabase.from('offers').delete().eq('id', offer_id)
  revalidatePath(`/tasks/${task_id}`)
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

export async function claimTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to claim this task.' }

  const task_id = formData.get('task_id') as string
  const claim_token = formData.get('claim_token') as string

  if (!task_id || !claim_token) return { error: 'Invalid claim.' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, customer_id, claim_token, source')
    .eq('id', task_id)
    .single()

  if (!task || task.source !== 'nextdoor') return { error: 'Task not found.' }
  if (task.customer_id !== null) return { error: 'This task has already been claimed.' }
  if (task.claim_token !== claim_token) return { error: 'Invalid claim token.' }

  const { error } = await supabase
    .from('tasks')
    .update({ customer_id: user.id, claim_token: null })
    .eq('id', task_id)
    .is('customer_id', null)

  if (error) return { error: 'Failed to claim task.' }

  revalidatePath(`/tasks/${task_id}`)
}

// Release funds to worker — called when customer marks complete or auto-release fires
export async function releaseFunds(task_id: string) {
  const supabase = await createClient()
  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, payment_intent_id, payment_status')
    .eq('id', task_id)
    .single()

  if (task) await releasePayment(task as any)
  revalidatePath(`/tasks/${task_id}`)
}
