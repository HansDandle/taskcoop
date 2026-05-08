import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Tasks' }

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { status } = await searchParams

  let query = supabase
    .from('tasks')
    .select('id, title, status, budget, zip_code, created_at, categories(name), users!customer_id(name)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: tasks } = await query.limit(100)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-700">← Admin</Link>
        <h1 className="text-2xl font-bold text-stone-900">Tasks</h1>
      </div>

      <div className="flex gap-2 mb-6 text-sm">
        {['', 'open', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/tasks?status=${s}` : '/admin/tasks'}
            className={`px-3 py-1.5 rounded-md border transition-colors ${status === s || (!s && !status) ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Task</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Budget</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {tasks?.map((t) => (
              <tr key={t.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/tasks/${t.id}`} className="font-medium text-stone-900 hover:underline">{t.title}</Link>
                  <div className="text-xs text-stone-400">{(t.categories as any)?.name} · {t.zip_code}</div>
                </td>
                <td className="px-4 py-3 text-stone-600">{(t.users as any)?.name}</td>
                <td className="px-4 py-3 text-stone-600">{t.budget ? formatCurrency(t.budget) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                    t.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                    t.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-700'
                  }`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-stone-500">{formatDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
