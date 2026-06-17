import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// User email lives in auth.users, not public.users — resolve it via the admin API.
export async function getUserEmail(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null
  const { data, error } = await createAdminClient().auth.admin.getUserById(userId)
  if (error) return null
  return data.user?.email ?? null
}
