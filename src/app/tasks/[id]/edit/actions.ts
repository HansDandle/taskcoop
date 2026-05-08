'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateTask(_prev: { error: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const task_id = formData.get('task_id') as string
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const category_id = formData.get('category_id') as string
  const budgetRaw = formData.get('budget') as string
  const preferred_time = formData.get('preferred_time') as string
  const imageUrlsRaw = formData.get('image_urls') as string
  const duration_estimate = (formData.get('duration_estimate') as string) || null
  const tools_situation = (formData.get('tools_situation') as string) || null
  const access_situation = (formData.get('access_situation') as string) || null
  const physicalRaw = formData.get('physical_requirements') as string

  const address_id = (formData.get('address_id') as string) || null
  const address_street = (formData.get('address_street') as string)?.trim() || null
  const address_city = (formData.get('address_city') as string)?.trim() || 'Austin'
  const address_state = (formData.get('address_state') as string)?.trim() || 'TX'
  const zip_code = (formData.get('zip_code') as string)?.trim()

  if (!title || !description || !category_id || !zip_code) {
    return { error: 'Please fill in all required fields.' }
  }

  const { data: task } = await supabase.from('tasks').select('customer_id').eq('id', task_id).single()
  if (!task || task.customer_id !== user.id) return { error: 'Not authorized.' }

  const budget = budgetRaw ? Number(budgetRaw) : null
  let physical_requirements: string[] = []
  try { physical_requirements = physicalRaw ? JSON.parse(physicalRaw) : [] } catch {}

  const { error } = await supabase
    .from('tasks')
    .update({
      title, description, category_id, zip_code, budget,
      preferred_time: preferred_time || null,
      duration_estimate, tools_situation, access_situation, physical_requirements,
      address_id, address_street, address_city, address_state,
      updated_at: new Date().toISOString(),
    })
    .eq('id', task_id)

  if (error) return { error: 'Failed to update task.' }

  let imageUrls: string[] = []
  try { imageUrls = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : [] } catch {}
  await supabase.from('task_images').delete().eq('task_id', task_id)
  if (imageUrls.length > 0) {
    await supabase.from('task_images').insert(imageUrls.map(url => ({ task_id, image_url: url })))
  }

  redirect(`/tasks/${task_id}`)
}
