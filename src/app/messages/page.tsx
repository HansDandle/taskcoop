import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Messages' }

export default async function MessagesInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/messages')

  // Fetch all messages involving this user with both sender and receiver info in one query
  const [{ data: profile }, { data: messages }] = await Promise.all([
    supabase.from('users').select('id, role').eq('id', user.id).single(),
    supabase
      .from('messages')
      .select('id, content, created_at, task_id, sender_id, receiver_id, tasks(id, title), sender:users!sender_id(id, name, avatar_url), receiver:users!receiver_id(id, name, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),
  ])

  // Deduplicate into threads: one per (task_id, other_user_id) pair
  const seen = new Set<string>()
  const threads: {
    taskId: string
    taskTitle: string
    otherUserId: string
    otherUserName: string
    otherUserAvatar: string | null
    lastMessage: string
    lastAt: string
  }[] = []

  for (const msg of messages ?? []) {
    const task = msg.tasks as any
    const isCurrentUserSender = msg.sender_id === user.id
    const otherUserId = isCurrentUserSender ? msg.receiver_id : msg.sender_id
    const key = `${msg.task_id}:${otherUserId}`
    if (seen.has(key)) continue
    seen.add(key)

    const otherUser = isCurrentUserSender ? (msg as any).receiver : (msg as any).sender

    threads.push({
      taskId: msg.task_id,
      taskTitle: task?.title ?? 'Task',
      otherUserId,
      otherUserName: otherUser?.name ?? '',
      otherUserAvatar: otherUser?.avatar_url ?? null,
      lastMessage: msg.content,
      lastAt: msg.created_at,
    })
  }

  const threadUrl = (t: typeof threads[0]) =>
    profile?.role === 'customer'
      ? `/messages/${t.taskId}?worker=${t.otherUserId}`
      : `/messages/${t.taskId}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700">← Dashboard</Link>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
        {threads.length === 0 ? (
          <div className="px-5 py-12 text-center text-stone-400">
            <p className="mb-2">No messages yet.</p>
            <Link href="/tasks" className="text-sm text-emerald-600 hover:underline">Browse tasks →</Link>
          </div>
        ) : (
          threads.map((t) => (
            <Link
              key={`${t.taskId}:${t.otherUserId}`}
              href={threadUrl(t)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
            >
              {t.otherUserAvatar ? (
                <img src={t.otherUserAvatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600 shrink-0">
                  {t.otherUserName?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-stone-900 text-sm">{t.otherUserName}</span>
                  <span className="text-xs text-stone-400 shrink-0">{formatRelativeDate(t.lastAt)}</span>
                </div>
                <div className="text-xs text-stone-500 truncate mt-0.5">Re: {t.taskTitle}</div>
                <div className="text-xs text-stone-400 truncate mt-0.5">{t.lastMessage}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
