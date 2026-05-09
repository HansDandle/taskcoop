'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(_prev: { error: string; success: boolean }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', success: false }

  const name = (formData.get('name') as string).trim()
  const bio = (formData.get('bio') as string).trim() || null
  const avatar_url = (formData.get('avatar_url') as string) || null
  const portfolioRaw = formData.get('portfolio_urls') as string

  if (!name) return { error: 'Name is required.', success: false }

  let portfolio_urls: string[] = []
  try { portfolio_urls = portfolioRaw ? JSON.parse(portfolioRaw) : [] } catch {}

  const { error } = await supabase
    .from('users')
    .update({ name, bio, avatar_url, portfolio_urls, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update profile.', success: false }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function submitIdVerification(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', success: false }

  const id_document_url = formData.get('id_document_url') as string
  if (!id_document_url) return { error: 'No document provided.', success: false }

  await supabase
    .from('users')
    .update({ id_document_url, id_verification_status: 'pending', id_verified: false })
    .eq('id', user.id)

  revalidatePath('/profile')
  return { error: '', success: true }
}
