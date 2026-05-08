'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addAddress(_prev: { error: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const label = (formData.get('label') as string).trim() || 'Home'
  const street = (formData.get('street') as string).trim()
  const city = (formData.get('city') as string).trim() || 'Austin'
  const state = (formData.get('state') as string).trim() || 'TX'
  const zip = (formData.get('zip') as string).trim()

  if (!street || !zip) return { error: 'Street and ZIP are required.' }

  const { error } = await supabase.from('customer_addresses').insert({ user_id: user.id, label, street, city, state, zip })
  if (error) return { error: 'Failed to save address.' }

  revalidatePath('/profile')
  return { error: '' }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('customer_addresses').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}
