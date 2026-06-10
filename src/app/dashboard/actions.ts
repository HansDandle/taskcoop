'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteOffer(offerId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('offers')
    .update({ status: 'withdrawn' })
    .eq('id', offerId)
    .eq('worker_id', user.id)
    .eq('status', 'pending')

  revalidatePath('/dashboard')
}

export async function dismissLead(taskId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Only allow dismissing tasks this worker sourced
  await supabase
    .from('tasks')
    .update({ sourced_by_worker_id: null })
    .eq('id', taskId)
    .eq('sourced_by_worker_id', user.id)
    .eq('customer_id', null)

  revalidatePath('/dashboard')
}

export async function saveReplyTemplate(formData: FormData): Promise<void> {
  const template = (formData.get('reply_template') as string | null)?.trim() ?? ''
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('users')
    .update({ reply_template: template || null })
    .eq('id', user.id)

  revalidatePath('/dashboard')
}
