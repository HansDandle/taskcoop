'use server'

import { createClient } from '@/lib/supabase/server'

type SourcedTaskInput = {
  title: string
  body: string
  externalId: string
  externalUrl: string
  neighborhood: string
  amount?: string
  message?: string
}

export async function createSourcedTask(
  input: SourcedTaskInput,
): Promise<{ taskId: string; claimToken: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role, stripe_onboarded')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'worker') return { error: 'Only members can offer on Nextdoor posts.' }
  if (!profile?.stripe_onboarded) return { error: 'Set up payouts before submitting offers.' }

  // Parse a numeric value from free-text amount (e.g. "$50–80" → 50, "starting at $40" → 40).
  // Stored as null if no number is found — the raw text lives in the reply template.
  const numericAmount = input.amount ? parseFloat(input.amount.replace(/[^0-9.]/g, '')) || null : null

  // Each worker gets their own stub. No deduplication: if two workers offer on
  // the same Nextdoor post, they each get an independent task with their own
  // claim URL. The OP picks one; the other stays pending in the other worker's leads.
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      customer_id: null,
      title: input.title,
      description: input.body,
      source: 'nextdoor',
      external_id: input.externalId,
      external_url: input.externalUrl,
      sourced_by_worker_id: user.id,
      status: 'open',
    })
    .select('id, claim_token')
    .single()

  if (taskError || !task) {
    console.error('[createSourcedTask] insert error:', taskError)
    return { error: 'Failed to create task.' }
  }

  const { error: offerError } = await supabase
    .from('offers')
    .insert({
      task_id: task.id,
      worker_id: user.id,
      amount: numericAmount,
      message: input.message ?? null,
    })

  if (offerError) return { error: 'Failed to submit offer.' }

  return { taskId: task.id, claimToken: task.claim_token }
}
