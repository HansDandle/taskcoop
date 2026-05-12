'use server'

import { createClient } from '@/lib/supabase/server'
import { sendNewMessageEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'

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

  // Notify recipient (fire-and-forget — don't block message delivery)
  const [{ data: sender }, { data: receiver }, { data: task }] = await Promise.all([
    supabase.from('users').select('name').eq('id', user.id).single(),
    supabase.from('users').select('email').eq('id', receiver_id).single(),
    supabase.from('tasks').select('title').eq('id', task_id).single(),
  ])
  if (receiver?.email && sender && task) {
    sendNewMessageEmail(receiver.email, sender.name, task.title, task_id, content)
  }
  if (sender && task) {
    await sendPushToUser(receiver_id, {
      title: `${sender.name}: ${task.title}`,
      body: content.slice(0, 140),
      url: `/messages/${task_id}`,
      tag: `msg-${task_id}`,
    })
  }

  return { message }
}
