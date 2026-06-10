'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveReplyTemplate(formData: FormData): Promise<void> {
  const template = (formData.get('reply_template') as string | null)?.trim() ?? ''
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('users')
    .update({ reply_template: template || null })
    .eq('id', user.id)

  revalidatePath('/dashboard')
}
