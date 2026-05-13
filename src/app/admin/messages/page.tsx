import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Messages' }

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ task_id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase.rpc('get_my_role')
  if (roleData !== 'admin') redirect('/')

  const { task_id } = await searchParams

  if (task_id) {
    // Show full thread for a specific task
    const [{ data: messages }, { data: task }] = await Promise.all([
      supabase
        .from('messages')
        .select('id, content, created_at, sender_id, receiver_id, users!sender_id(name, avatar_url)')
        .eq('task_id', task_id)
        .order('created_at', { ascending: true }),
      supabase.from('tasks').select('id, title').eq('id', task_id).single(),
    ])

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/messages" className="text-sm text-stone-500 hover:text-stone-700">← Messages</Link>
          <span className="text-stone-300" aria-hidden="true">/</span>
          <h1 className="text-lg font-bold text-stone-900 truncate">{task?.title ?? 'Thread'}</h1>
          <Link href={`/tasks/${task_id}`} target="_blank" className="text-xs text-emerald-600 hover:underline ml-auto shrink-0">View task →</Link>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
          {!messages?.length && (
            <div className="px-5 py-8 text-center text-stone-500 text-sm">No messages in this thread.</div>
          )}
          {messages?.map(m => (
            <div key={m.id} className="px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-stone-900">{(m.users as any)?.name}</span>
                <span className="text-xs text-stone-500">{formatRelativeDate(m.created_at)}</span>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{m.content}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // List all message threads (grouped by task)
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, created_at, task_id, tasks(id, title)')
    .order('created_at', { ascending: false })
    .limit(500)

  // Deduplicate into one row per task
  const seen = new Set<string>()
  const threads: { taskId: string; taskTitle: string; lastMessage: string; lastAt: string }[] = []
  for (const m of messages ?? []) {
    if (seen.has(m.task_id)) continue
    seen.add(m.task_id)
    threads.push({
      taskId: m.task_id,
      taskTitle: (m.tasks as any)?.title ?? 'Unknown task',
      lastMessage: m.content,
      lastAt: m.created_at,
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-700">← Admin</Link>
        <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
        <span className="text-sm text-stone-500">{threads.length} thread{threads.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
        {!threads.length && (
          <div className="px-5 py-10 text-center text-stone-500">No messages yet.</div>
        )}
        {threads.map(t => (
          <Link
            key={t.taskId}
            href={`/admin/messages?task_id=${t.taskId}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
          >
            <div className="min-w-0">
              <div className="font-medium text-stone-900 text-sm truncate">{t.taskTitle}</div>
              <div className="text-xs text-stone-500 truncate mt-0.5">{t.lastMessage}</div>
            </div>
            <div className="text-xs text-stone-500 shrink-0 ml-4">{formatRelativeDate(t.lastAt)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
