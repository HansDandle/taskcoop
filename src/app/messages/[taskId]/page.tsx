import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MessageThread from './message-thread'

export const metadata: Metadata = { title: 'Messages' }

export default async function MessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>
  searchParams: Promise<{ worker?: string }>
}) {
  const { taskId } = await params
  const { worker: workerId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: task }, { data: profile }] = await Promise.all([
    supabase.from('tasks').select('id, title, customer_id').eq('id', taskId).single(),
    supabase.from('users').select('id, name, role').eq('id', user.id).single(),
  ])

  if (!task) notFound()

  // Determine the other party
  let otherUserId: string | null = null
  if (profile?.role === 'customer' && workerId) {
    otherUserId = workerId
  } else if (profile?.role === 'worker') {
    otherUserId = task.customer_id
  }

  if (!otherUserId) redirect('/dashboard')

  const [{ data: otherUser }, { data: messages }] = await Promise.all([
    supabase.from('users').select('id, name, avatar_url').eq('id', otherUserId).single(),
    supabase
      .from('messages')
      .select('id, content, sender_id, created_at')
      .eq('task_id', taskId)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true }),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-full">
      <div className="mb-4">
        <Link href={`/tasks/${taskId}`} className="text-sm text-stone-500 hover:text-stone-700">← Back to task</Link>
      </div>
      <div className="bg-white border border-stone-200 rounded-lg flex flex-col flex-1">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center gap-3">
          {(otherUser as any)?.avatar_url ? (
            <img src={(otherUser as any).avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600">
              {(otherUser as any)?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-stone-900 text-sm">{(otherUser as any)?.name}</div>
            <div className="text-xs text-stone-400">Re: {task.title}</div>
          </div>
        </div>
        <MessageThread
          messages={messages ?? []}
          currentUserId={user.id}
          taskId={taskId}
          receiverId={otherUserId}
        />
      </div>
    </div>
  )
}
