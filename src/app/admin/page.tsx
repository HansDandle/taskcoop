import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [
    { count: userCount },
    { count: taskCount },
    { count: openTaskCount },
    { count: completedTaskCount },
    { data: recentUsers },
    { data: recentTasks },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('users').select('id, name, role, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('tasks').select('id, title, status, budget, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total users', value: userCount ?? 0 },
          { label: 'Total tasks', value: taskCount ?? 0 },
          { label: 'Open tasks', value: openTaskCount ?? 0 },
          { label: 'Completed', value: completedTaskCount ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
            <div className="text-sm text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent users */}
        <div className="bg-white border border-stone-200 rounded-lg">
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Recent users</h2>
            <Link href="/admin/users" className="text-xs text-emerald-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentUsers?.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-stone-900">{u.name}</div>
                  <div className="text-xs text-stone-400">{formatDate(u.created_at)}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.role === 'worker' ? 'bg-blue-50 text-blue-700' :
                  u.role === 'admin' ? 'bg-red-50 text-red-700' :
                  'bg-stone-100 text-stone-600'
                }`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tasks */}
        <div className="bg-white border border-stone-200 rounded-lg">
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Recent tasks</h2>
            <Link href="/admin/tasks" className="text-xs text-emerald-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentTasks?.map((t) => (
              <Link key={t.id} href={`/tasks/${t.id}`} className="px-5 py-3 flex items-center justify-between text-sm hover:bg-stone-50 transition-colors block">
                <div>
                  <div className="font-medium text-stone-900 truncate max-w-xs">{t.title}</div>
                  <div className="text-xs text-stone-400">{formatDate(t.created_at)} {t.budget ? `· ${formatCurrency(t.budget)}` : ''}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                  t.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                  'bg-amber-50 text-amber-700'
                }`}>{t.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
