'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const task_id = formData.get('task_id') as string
  const receiver_id = formData.get('receiver_id') as string
  const content = (formData.get('content') as string).trim()

  if (!content || !task_id || !receiver_id) return { error: 'Invalid message.' }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ task_id, sender_id: user.id, receiver_id, content })
    .select('id, content, sender_id, created_at')
    .single()

  if (error) return { error: 'Failed to send message.' }
  return { message }
}
