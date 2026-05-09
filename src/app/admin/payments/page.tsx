import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Payments' }

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase.rpc('get_my_role')
  if (roleData !== 'admin') redirect('/')

  const { status } = await searchParams

  let query = supabase
    .from('tasks')
    .select('id, title, budget, payment_status, payment_intent_id, funds_release_at, created_at, users!customer_id(id, name)')
    .not('payment_status', 'eq', 'unpaid')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('payment_status', status)

  const { data: tasks } = await query.limit(200)

  // Pull accepted offer amounts for each task
  const taskIds = tasks?.map(t => t.id) ?? []
  const { data: offers } = taskIds.length > 0
    ? await supabase
        .from('offers')
        .select('task_id, amount, worker_id, users!worker_id(id, name)')
        .in('task_id', taskIds)
        .eq('status', 'accepted')
    : { data: [] }

  const offerMap = Object.fromEntries((offers ?? []).map(o => [o.task_id, o]))

  const held = tasks?.filter(t => t.payment_status === 'held') ?? []
  const released = tasks?.filter(t => t.payment_status === 'released') ?? []
  const heldTotal = held.reduce((sum, t) => sum + (offerMap[t.id]?.amount ?? 0), 0)
  const releasedTotal = released.reduce((sum, t) => sum + (offerMap[t.id]?.amount ?? 0), 0)
  const platformFees = releasedTotal * 0.05

  const TABS = [
    { label: 'All', value: '' },
    { label: 'Held', value: 'held' },
    { label: 'Released', value: 'released' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-700">← Admin</Link>
        <h1 className="text-2xl font-bold text-stone-900">Payments</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(heldTotal)}</div>
          <div className="text-sm text-stone-500 mt-1">Held in escrow ({held.length})</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(releasedTotal)}</div>
          <div className="text-sm text-stone-500 mt-1">Released to members ({released.length})</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-stone-900">{formatCurrency(platformFees)}</div>
          <div className="text-sm text-stone-500 mt-1">Platform fees earned (5%)</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-stone-900">{formatCurrency(heldTotal + releasedTotal)}</div>
          <div className="text-sm text-stone-500 mt-1">Total volume</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-200">
        {TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/payments?status=${tab.value}` : '/admin/payments'}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              (status ?? '') === tab.value
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Task</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Member</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Auto-release</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {!tasks?.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">No payments found.</td></tr>
            )}
            {tasks?.map((t) => {
              const offer = offerMap[t.id]
              const autoRelease = t.funds_release_at ? new Date(t.funds_release_at) : null
              const overdue = autoRelease && autoRelease < new Date() && t.payment_status === 'held'
              return (
                <tr key={t.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/tasks/${t.id}`} target="_blank" className="font-medium text-stone-900 hover:underline">{t.title}</Link>
                    {t.payment_intent_id && (
                      <div className="text-xs text-stone-400 font-mono">{t.payment_intent_id}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${(t.users as any)?.id}`} className="text-xs text-stone-600 hover:underline">
                      {(t.users as any)?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {offer ? (
                      <Link href={`/admin/users/${(offer.users as any)?.id}`} className="text-xs text-stone-600 hover:underline">
                        {(offer.users as any)?.name}
                      </Link>
                    ) : <span className="text-xs text-stone-400">—</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {offer ? formatCurrency(offer.amount) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.payment_status === 'released' ? 'bg-emerald-50 text-emerald-700' :
                      t.payment_status === 'held' ? 'bg-blue-50 text-blue-700' :
                      'bg-stone-100 text-stone-500'
                    }`}>{t.payment_status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {autoRelease ? (
                      <span className={overdue ? 'text-red-600 font-medium' : 'text-stone-500'}>
                        {overdue ? 'Overdue — ' : ''}{autoRelease.toLocaleDateString()}
                      </span>
                    ) : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(t.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
