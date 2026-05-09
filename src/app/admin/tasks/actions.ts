'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return null
  return supabase
}

export async function adminCancelTask(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }
  const task_id = formData.get('task_id') as string
  await supabase.from('tasks').update({ status: 'cancelled' }).eq('id', task_id)
  revalidatePath('/admin/tasks')
  revalidatePath(`/tasks/${task_id}`)
}

export async function adminDeleteTask(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }
  const task_id = formData.get('task_id') as string
  await supabase.from('tasks').delete().eq('id', task_id)
  revalidatePath('/admin/tasks')
}
