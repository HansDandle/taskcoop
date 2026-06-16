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

type LicenseSubmission = { title: string; path: string; approved?: boolean }

function mergeLicenses(raw: string | null, existing: LicenseSubmission[] | undefined) {
  // Preserve admin-set "approved" flags on existing licenses; strip approval on
  // anything new so admins explicitly re-approve.
  const approvedByPath = new Map<string, boolean>()
  for (const row of (existing ?? [])) {
    if (row?.path) approvedByPath.set(row.path, !!row.approved)
  }
  let parsed: LicenseSubmission[] = []
  try { parsed = raw ? JSON.parse(raw) : [] } catch {}
  return parsed
    .filter(l => l && typeof l.path === 'string' && l.path.length > 0)
    .slice(0, 8)
    .map(l => ({
      title: (l.title ?? '').toString().slice(0, 80).trim() || 'License',
      path: l.path,
      approved: approvedByPath.get(l.path) ?? false,
    }))
}

// Persist whatever the worker has uploaded so far, without requiring a complete
// submission. Files land in storage as soon as they're picked, but until this
// runs the users row has no record of them, so a half-finished applicant (e.g.
// ID uploaded, no selfie) is invisible to admins. Only the field(s) present in
// the form are written, and verification status is never changed here — the
// explicit "Submit for review" flow owns the pending/verified transitions.
export async function saveIdDraft(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: existing } = await supabase
    .from('users')
    .select('id_verified, id_verification_status, professional_licenses')
    .eq('id', user.id)
    .single()

  // Leave already-verified or under-review records alone; their edits go through
  // submitIdVerification, not draft autosave.
  if (existing?.id_verified || existing?.id_verification_status === 'pending') {
    return { error: null }
  }

  const update: Record<string, unknown> = {}
  if (formData.has('id_document_url')) {
    update.id_document_url = (formData.get('id_document_url') as string)?.trim() || null
  }
  if (formData.has('id_selfie_url')) {
    update.id_selfie_url = (formData.get('id_selfie_url') as string)?.trim() || null
  }
  if (formData.has('professional_licenses')) {
    update.professional_licenses = mergeLicenses(
      formData.get('professional_licenses') as string | null,
      existing?.professional_licenses as LicenseSubmission[] | undefined,
    )
  }
  if (Object.keys(update).length === 0) return { error: null }

  const { error } = await supabase.from('users').update(update).eq('id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { error: null }
}

export async function submitIdVerification(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', success: false }

  const id_document_url = (formData.get('id_document_url') as string)?.trim()
  const id_selfie_url = (formData.get('id_selfie_url') as string)?.trim()
  const licensesRaw = formData.get('professional_licenses') as string | null

  if (!id_document_url) return { error: 'Please upload a photo of your ID.', success: false }
  if (!id_selfie_url) return { error: 'Please upload a selfie holding your ID.', success: false }

  const { data: existing } = await supabase
    .from('users')
    .select('id_document_url, id_selfie_url, id_verified, professional_licenses')
    .eq('id', user.id)
    .single()

  const professional_licenses = mergeLicenses(
    licensesRaw,
    existing?.professional_licenses as LicenseSubmission[] | undefined,
  )

  // Only flip verification status back to "pending" if the ID or selfie actually
  // changed. License-only edits by an already-verified worker shouldn't revoke
  // their verified badge — each new license is approved separately by an admin.
  const idChanged = existing?.id_document_url !== id_document_url
  const selfieChanged = existing?.id_selfie_url !== id_selfie_url
  const docsChanged = idChanged || selfieChanged
  const wasVerified = !!existing?.id_verified

  const update: Record<string, unknown> = {
    id_document_url,
    id_selfie_url,
    professional_licenses,
  }
  if (docsChanged || !wasVerified) {
    update.id_verification_status = 'pending'
    update.id_verified = false
  }

  await supabase
    .from('users')
    .update(update)
    .eq('id', user.id)

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath(`/workers/${user.id}`)
  return { error: '', success: true }
}
