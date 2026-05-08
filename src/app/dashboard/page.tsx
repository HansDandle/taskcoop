import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  if (profile.role === 'customer') {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, budget, created_at, categories(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const openCount = tasks?.filter(t => t.status === 'open').length ?? 0
    const completedCount = tasks?.filter(t => t.status === 'completed').length ?? 0

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Welcome back, {profile.name}</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your tasks and messages</p>
          </div>
          <Link href="/tasks/new" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Post a Task
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-stone-900">{tasks?.length ?? 0}</div>
            <div className="text-sm text-stone-500 mt-1">Total tasks</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-600">{openCount}</div>
            <div className="text-sm text-stone-500 mt-1">Open tasks</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-stone-900">{completedCount}</div>
            <div className="text-sm text-stone-500 mt-1">Completed</div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg">
          <div className="px-5 py-4 border-b border-stone-200">
            <h2 className="font-semibold text-stone-900">Your tasks</h2>
          </div>
          {!tasks || tasks.length === 0 ? (
            <div className="px-5 py-10 text-center text-stone-400">
              <p className="mb-4">You haven't posted any tasks yet.</p>
              <Link href="/tasks/new" className="text-sm text-emerald-600 hover:underline">Post your first task →</Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{task.title}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{(task.categories as any)?.name} · {formatRelativeDate(task.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.budget && <span className="text-sm text-stone-600">{formatCurrency(task.budget)}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                      task.status === 'assigned' ? 'bg-blue-50 text-blue-700' :
                      task.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                      task.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link href="/profile" className="text-sm text-stone-500 hover:text-stone-700">Edit profile →</Link>
        </div>
      </div>
    )
  }

  // Worker dashboard
  const stripeOnboarded = profile.stripe_onboarded ?? false

  const { data: offers } = await supabase
    .from('offers')
    .select('id, amount, status, created_at, tasks(id, title, status, customer_id, categories(name))')
    .eq('worker_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const accepted = offers?.filter(o => o.status === 'accepted') ?? []
  const pending = offers?.filter(o => o.status === 'pending') ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back, {profile.name}</h1>
          <p className="text-stone-500 text-sm mt-1">Your offers and active jobs</p>
        </div>
        <Link href="/tasks" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
          Browse Tasks
        </Link>
      </div>

      {!stripeOnboarded && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-900 text-sm">Connect your bank account to get paid</p>
            <p className="text-xs text-amber-700 mt-1">You can browse tasks, but you'll need to set up payouts before submitting offers.</p>
          </div>
          <Link
            href="/api/stripe/connect"
            className="shrink-0 text-sm bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors font-medium"
          >
            Set up payouts →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-stone-900">{offers?.length ?? 0}</div>
          <div className="text-sm text-stone-500 mt-1">Total offers</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-600">{pending.length}</div>
          <div className="text-sm text-stone-500 mt-1">Pending</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-stone-900">{accepted.length}</div>
          <div className="text-sm text-stone-500 mt-1">Accepted</div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg">
        <div className="px-5 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-stone-900">Your offers</h2>
        </div>
        {!offers || offers.length === 0 ? (
          <div className="px-5 py-10 text-center text-stone-400">
            <p className="mb-4">You haven't submitted any offers yet.</p>
            <Link href="/tasks" className="text-sm text-emerald-600 hover:underline">Browse open tasks →</Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {offers.map((offer) => {
              const task = offer.tasks as any
              return (
                <Link key={offer.id} href={`/tasks/${task?.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{task?.title}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{task?.categories?.name} · {formatRelativeDate(offer.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-600">{formatCurrency(offer.amount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      offer.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      offer.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/profile" className="text-stone-500 hover:text-stone-700">Edit profile →</Link>
        <Link href={`/workers/${user.id}`} className="text-stone-500 hover:text-stone-700">View public profile →</Link>
      </div>
    </div>
  )
}
