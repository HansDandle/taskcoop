import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate, formatCurrency, formatRelativeDate } from '@/lib/utils'
import AdminTaskActions from './admin-task-actions'

export const metadata: Metadata = { title: 'Admin — Tasks' }

const STATUS_TABS = ['', 'open', 'assigned', 'in_progress', 'completed', 'cancelled']

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase.rpc('get_my_role')
  if (roleData !== 'admin') redirect('/')

  const { status, q } = await searchParams

  let query = supabase
    .from('tasks')
    .select('id, title, status, budget, zip_code, created_at, payment_status, categories(name), users!customer_id(id, name)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: tasks } = await query.limit(200)

  // Offers are RLS-gated to the task owner and offer creator, so admins can't
  // see them through the normal client. Read them with the service role here.
  type OfferRow = { id: string; task_id: string; amount: number; status: string; message: string | null; worker_id: string; created_at: string }
  const taskIds = (tasks ?? []).map(t => t.id)
  const admin = createAdminClient()
  const allOffers: OfferRow[] = taskIds.length
    ? (((await admin
        .from('offers')
        .select('id, task_id, amount, status, message, worker_id, created_at')
        .in('task_id', taskIds)
        .order('created_at', { ascending: true })).data ?? []) as OfferRow[])
    : []

  const workerIds = [...new Set(allOffers.map(o => o.worker_id))]
  const { data: workers } = workerIds.length
    ? await admin.from('users').select('id, name').in('id', workerIds)
    : { data: [] }
  const workerName = new Map((workers ?? []).map(w => [w.id, w.name as string]))

  const offersByTask = new Map<string, OfferRow[]>()
  for (const o of allOffers) {
    const arr = offersByTask.get(o.task_id) ?? []
    arr.push(o)
    offersByTask.set(o.task_id, arr)
  }

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s || 'all'] = s ? tasks?.filter(t => t.status === s).length ?? 0 : tasks?.length ?? 0
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-700">← Admin</Link>
        <h1 className="text-2xl font-bold text-stone-900">Tasks</h1>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-200 flex-wrap">
        {STATUS_TABS.map(s => (
          <Link
            key={s}
            href={s ? `/admin/tasks?status=${s}` : '/admin/tasks'}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              (status ?? '') === s
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {s || 'All'}
            <span className="ml-1.5 text-xs text-stone-500">{counts[s || 'all']}</span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="flex gap-3 mb-5">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Search by title…"
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />
        <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm">Search</button>
        {q && <Link href={status ? `/admin/tasks?status=${status}` : '/admin/tasks'} className="text-sm text-stone-500 self-center hover:underline">Clear</Link>}
      </form>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Task</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Budget</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Offers</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {!tasks?.length && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-stone-500">No tasks found.</td></tr>
            )}
            {tasks?.map((t) => (
              <tr key={t.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/tasks/${t.id}`} target="_blank" className="font-medium text-stone-900 hover:underline">{t.title}</Link>
                  <div className="text-xs text-stone-500">{(t.categories as any)?.name} · {t.zip_code}</div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${(t.users as any)?.id}`} className="text-stone-600 hover:underline text-xs">
                    {(t.users as any)?.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone-600">{t.budget ? formatCurrency(t.budget) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.payment_status === 'released' ? 'bg-emerald-50 text-emerald-700' :
                    t.payment_status === 'held' ? 'bg-blue-50 text-blue-700' :
                    'bg-stone-100 text-stone-500'
                  }`}>{t.payment_status ?? 'unpaid'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                    t.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                    t.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-700'
                  }`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  {(offersByTask.get(t.id)?.length ?? 0) === 0 ? (
                    <span className="text-xs text-stone-400">—</span>
                  ) : (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-stone-700 font-medium select-none">
                        {offersByTask.get(t.id)!.length} offer{offersByTask.get(t.id)!.length !== 1 ? 's' : ''}
                      </summary>
                      <ul className="mt-2 space-y-2 min-w-[180px]">
                        {offersByTask.get(t.id)!.map((o) => (
                          <li key={o.id} className="border-l-2 border-stone-200 pl-2">
                            <div className="text-stone-700">
                              <span className="font-medium text-stone-900">{workerName.get(o.worker_id) ?? 'Unknown'}</span>
                              {' · '}{formatCurrency(o.amount)}
                              {' · '}<span className="text-stone-500">{o.status}</span>
                            </div>
                            <div className="text-stone-400 mt-0.5">offered {formatRelativeDate(o.created_at)}</div>
                            {o.message && <div className="text-stone-500 italic mt-0.5">&ldquo;{o.message}&rdquo;</div>}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(t.created_at)}</td>
                <td className="px-4 py-3">
                  <AdminTaskActions taskId={t.id} status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
