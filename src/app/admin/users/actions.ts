'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function changeUserRole(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const { data: admin } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (admin?.role !== 'admin') return { error: 'Not authorized.' }

  const user_id = formData.get('user_id') as string
  const role = formData.get('role') as string

  if (!['customer', 'worker', 'admin'].includes(role)) return { error: 'Invalid role.' }

  await supabase.from('users').update({ role }).eq('id', user_id)
  revalidatePath('/admin/users')
}
