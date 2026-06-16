'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: role } = await supabase.rpc('get_my_role')
  return role === 'admin'
}

// Service-role client bypasses RLS. The tasks table has no DELETE policy and its
// UPDATE policies require auth.uid() = customer_id, so socially-sourced tasks
// (customer_id IS NULL) can't be cancelled or deleted by the user-scoped client.
// We gate every call behind requireAdmin() above.
function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function adminCancelTask(formData: FormData) {
  if (!await requireAdmin()) return { error: 'Not authorized.' }
  const task_id = formData.get('task_id') as string
  const { error } = await serviceClient()
    .from('tasks').update({ status: 'cancelled' }).eq('id', task_id)
  if (error) return { error: error.message }
  revalidatePath('/admin/tasks')
  revalidatePath(`/tasks/${task_id}`)
  return { error: null }
}

export async function adminDeleteTask(formData: FormData) {
  if (!await requireAdmin()) return { error: 'Not authorized.' }
  const task_id = formData.get('task_id') as string
  const { error } = await serviceClient()
    .from('tasks').delete().eq('id', task_id)
  if (error) return { error: error.message }
  revalidatePath('/admin/tasks')
  return { error: null }
}
