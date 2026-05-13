'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return null
  return supabase
}

export async function changeUserRole(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }

  const user_id = formData.get('user_id') as string
  const role = formData.get('role') as string
  if (!['customer', 'worker', 'admin'].includes(role)) return { error: 'Invalid role.' }

  await supabase.from('users').update({ role }).eq('id', user_id)
  revalidatePath('/admin/users')
}

export async function suspendUser(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }

  const user_id = formData.get('user_id') as string
  const suspended = formData.get('suspended') === 'true'
  await supabase.from('users').update({ suspended }).eq('id', user_id)
  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }

  const user_id = formData.get('user_id') as string

  // Use service role to delete from auth.users (cascades to public.users via trigger)
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  await service.auth.admin.deleteUser(user_id)
  revalidatePath('/admin/users')
}

export async function getIdDocumentPath(user_id: string): Promise<string | null> {
  const supabase = await requireAdmin()
  if (!supabase) return null
  const { data } = await supabase
    .from('users')
    .select('id_document_url')
    .eq('id', user_id)
    .single()
  return data?.id_document_url ?? null
}

export async function getIdSelfiePath(user_id: string): Promise<string | null> {
  const supabase = await requireAdmin()
  if (!supabase) return null
  const { data } = await supabase
    .from('users')
    .select('id_selfie_url')
    .eq('id', user_id)
    .single()
  return data?.id_selfie_url ?? null
}

export async function setLicenseApproval(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }

  const user_id = formData.get('user_id') as string
  const path = formData.get('path') as string
  const approved = formData.get('approved') === 'true'

  const { data: row } = await supabase
    .from('users')
    .select('professional_licenses')
    .eq('id', user_id)
    .single()

  const licenses = Array.isArray(row?.professional_licenses) ? row.professional_licenses : []
  const next = licenses.map((l: any) =>
    l?.path === path ? { ...l, approved } : l
  )

  await supabase.from('users').update({ professional_licenses: next }).eq('id', user_id)
  revalidatePath(`/admin/users/${user_id}`)
  revalidatePath(`/workers/${user_id}`)
}

export async function saveAdminNotes(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }
  const user_id = formData.get('user_id') as string
  const notes = formData.get('notes') as string
  await supabase.from('users').update({ admin_notes: notes || null }).eq('id', user_id)
  revalidatePath(`/admin/users/${user_id}`)
}

export async function setIdVerification(formData: FormData) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Not authorized.' }

  const user_id = formData.get('user_id') as string
  const status = formData.get('status') as string
  if (!['approved', 'rejected'].includes(status)) return { error: 'Invalid status.' }

  await supabase.from('users').update({
    id_verification_status: status,
    id_verified: status === 'approved',
  }).eq('id', user_id)
  revalidatePath('/admin/users')
}
