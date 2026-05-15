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

  const { data: roleData } = await supabase.rpc('get_my_role')
  if (roleData !== 'admin') redirect('/')

  const [
    { count: customerCount },
    { count: memberCount },
    { count: openTaskCount },
    { count: completedTaskCount },
    { count: heldCount },
    { count: pendingIdCount },
    { data: recentUsers },
    { data: recentTasks },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'worker'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('payment_status', 'held'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('id_verification_status', 'pending'),
    supabase.from('users').select('id, name, role, created_at, suspended').order('created_at', { ascending: false }).limit(8),
    supabase.from('tasks').select('id, title, status, budget, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/users" className="border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors">Users</Link>
          <Link href="/admin/users?verification=pending" className={`border px-4 py-2 rounded-md transition-colors ${(pendingIdCount ?? 0) > 0 ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-stone-200 hover:bg-stone-50'}`}>
            ID Review{(pendingIdCount ?? 0) > 0 ? ` (${pendingIdCount})` : ''}
          </Link>
          <Link href="/admin/tasks" className="border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors">Tasks</Link>
          <Link href="/admin/payments" className="border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors">Payments</Link>
          <Link href="/admin/messages" className="border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors">Messages</Link>
          <Link href="/admin/email" className="border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors">Email blast</Link>
        </div>
      </div>

      {/* Alert banners */}
      {(pendingIdCount ?? 0) > 0 && (
        <Link href="/admin/users?verification=pending"
          className="flex items-center justify-between mb-6 bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 hover:bg-amber-100 transition-colors">
          <span className="text-sm font-medium text-amber-900">
            {pendingIdCount} ID verification{pendingIdCount !== 1 ? 's' : ''} waiting for review
          </span>
          <span className="text-xs text-amber-700">Review →</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Customers', value: customerCount ?? 0, href: '/admin/users?role=customer', color: 'text-stone-900' },
          { label: 'Members', value: memberCount ?? 0, href: '/admin/users?role=worker', color: 'text-blue-600' },
          { label: 'Open tasks', value: openTaskCount ?? 0, href: '/admin/tasks?status=open', color: 'text-emerald-600' },
          { label: 'Completed tasks', value: completedTaskCount ?? 0, href: '/admin/tasks?status=completed', color: 'text-stone-900' },
          { label: 'Payments in escrow', value: heldCount ?? 0, href: '/admin/payments?status=held', color: 'text-blue-600' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-stone-200 rounded-lg p-4 hover:border-stone-400 transition-colors">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-stone-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent users */}
        <div className="bg-white border border-stone-200 rounded-lg">
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Recent signups</h2>
            <Link href="/admin/users" className="text-xs text-emerald-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentUsers?.map((u) => (
              <Link key={u.id} href={`/admin/users/${u.id}`}
                className={`px-5 py-3 flex items-center justify-between text-sm hover:bg-stone-50 transition-colors ${u.suspended ? 'opacity-50' : ''}`}>
                <div>
                  <div className="font-medium text-stone-900">{u.name}</div>
                  <div className="text-xs text-stone-400">{formatDate(u.created_at)}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.role === 'worker' ? 'bg-blue-50 text-blue-700' :
                  u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                  'bg-stone-100 text-stone-600'
                }`}>{u.role === 'worker' ? 'member' : u.role}</span>
              </Link>
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
              <Link key={t.id} href={`/tasks/${t.id}`} target="_blank"
                className="px-5 py-3 flex items-center justify-between text-sm hover:bg-stone-50 transition-colors">
                <div>
                  <div className="font-medium text-stone-900 truncate max-w-xs">{t.title}</div>
                  <div className="text-xs text-stone-400">{formatDate(t.created_at)} {t.budget ? `· ${formatCurrency(t.budget)}` : ''}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                  t.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                  t.status === 'cancelled' ? 'bg-red-50 text-red-600' :
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
