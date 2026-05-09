'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTask(_prev: { error: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const category_id = formData.get('category_id') as string
  const budgetRaw = formData.get('budget') as string
  const preferred_time = formData.get('preferred_time') as string
  const imageUrlsRaw = formData.get('image_urls') as string
  const duration_estimate = (formData.get('duration_estimate') as string) || null
  const tools_situation = formData.get('tools_situation') as string
  const access_situation = (formData.get('access_situation') as string) || null
  const physicalRaw = formData.get('physical_requirements') as string

  // Address fields — street stored separately in task_addresses
  const address_street = (formData.get('address_street') as string)?.trim() || null
  const address_city = (formData.get('address_city') as string)?.trim() || 'Austin'
  const address_state = (formData.get('address_state') as string)?.trim() || 'TX'
  const zip_code = (formData.get('zip_code') as string)?.trim()
  const save_address = formData.get('save_address') === 'on'

  if (!title || !description || !category_id || !zip_code || !tools_situation) {
    return { error: 'Please fill in all required fields.' }
  }
  if (!address_street) {
    return { error: 'Please provide a job location.' }
  }

  const budget = budgetRaw ? Number(budgetRaw) : null
  let physical_requirements: string[] = []
  try { physical_requirements = physicalRaw ? JSON.parse(physicalRaw) : [] } catch {}

  // Optionally save new address to profile
  if (address_street && save_address) {
    await supabase
      .from('customer_addresses')
      .insert({ user_id: user.id, label: 'Home', street: address_street, city: address_city, state: address_state, zip: zip_code })
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      customer_id: user.id,
      title, description, category_id, zip_code, budget,
      preferred_time: preferred_time || null,
      duration_estimate, tools_situation, access_situation, physical_requirements,
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to create task. Please try again.' }

  // Store address in task_addresses (RLS-protected)
  await supabase.from('task_addresses').insert({
    task_id: task.id,
    street: address_street,
    city: address_city,
    state: address_state,
  })

  let imageUrls: string[] = []
  try { imageUrls = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : [] } catch {}
  if (imageUrls.length > 0) {
    await supabase.from('task_images').insert(imageUrls.map((url) => ({ task_id: task.id, image_url: url })))
  }

  redirect(`/tasks/${task.id}`)
}
