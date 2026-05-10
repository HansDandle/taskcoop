import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { stripe } from '@/lib/stripe'
import ReferralLink from '@/components/referral-link'

export const metadata: Metadata = { title: 'Dashboard' }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-emerald-50 text-emerald-700',
    assigned: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-amber-50 text-amber-700',
    completed: 'bg-stone-100 text-stone-600',
    cancelled: 'bg-red-50 text-red-600',
    pending: 'bg-amber-50 text-amber-700',
    accepted: 'bg-blue-50 text-blue-700',
    rejected: 'bg-stone-100 text-stone-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-stone-100 text-stone-500'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function TaskRow({ task }: { task: any }) {
  return (
    <Link href={`/tasks/${task.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
      <div>
        <div className="font-medium text-stone-900 text-sm">{task.title}</div>
        <div className="text-xs text-stone-400 mt-0.5">{task.categories?.name} · {formatRelativeDate(task.created_at)}</div>
      </div>
      <div className="flex items-center gap-3">
        {task.budget && <span className="text-sm text-stone-500">{formatCurrency(task.budget)}</span>}
        <StatusBadge status={task.status} />
      </div>
    </Link>
  )
}

function Section({ title, children, empty, cta }: { title: string; children: React.ReactNode; empty?: string; cta?: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
        <h2 className="font-semibold text-stone-900 text-sm">{title}</h2>
        {cta}
      </div>
      {empty ? (
        <div className="px-5 py-6 text-sm text-stone-400 text-center">{empty}</div>
      ) : (
        <div className="divide-y divide-stone-100">{children}</div>
      )}
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  if (!profile || profile.role === 'admin') redirect('/admin')

  // If returning from Stripe Connect onboarding, sync the account status
  const { stripe: stripeParam } = await searchParams
  if (stripeParam === 'connected' && profile.stripe_account_id && !profile.stripe_onboarded) {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)
    if (account.details_submitted) {
      await supabase.from('users').update({ stripe_onboarded: true }).eq('id', user.id)
      profile.stripe_onboarded = true
    }
  }

  // ── Customer ──────────────────────────────────────────────────────────────
  if (profile.role === 'customer') {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, budget, created_at, categories(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const open = tasks?.filter(t => t.status === 'open') ?? []
    const active = tasks?.filter(t => ['assigned', 'in_progress'].includes(t.status)) ?? []
    const needsReview = tasks?.filter(t => t.status === 'completed') ?? [] // review check skipped for perf; link to review if not done
    const done = tasks?.filter(t => ['completed', 'cancelled'].includes(t.status)) ?? []

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Welcome back, {profile.name}</h1>
            <p className="text-stone-500 text-sm mt-1">Your tasks at a glance</p>
          </div>
          <Link href="/tasks/new" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Post a Task
          </Link>
        </div>

        <div className="space-y-4">
          {active.length > 0 && (
            <Section title={`Active (${active.length})`}>
              {active.map(t => <TaskRow key={t.id} task={t} />)}
            </Section>
          )}

          <Section
            title={`Open (${open.length})`}
            empty={open.length === 0 ? 'No open tasks.' : undefined}
            cta={<Link href="/tasks/new" className="text-xs text-emerald-600 hover:underline">+ Post task</Link>}
          >
            {open.map(t => <TaskRow key={t.id} task={t} />)}
          </Section>

          {needsReview.length > 0 && (
            <Section title={`Completed — rate your member (${needsReview.length})`}>
              {needsReview.map(t => (
                <Link key={t.id} href={`/tasks/${t.id}/review`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{t.title}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{(t as any).categories?.name} · {formatRelativeDate(t.created_at)}</div>
                  </div>
                  <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-medium">Rate member →</span>
                </Link>
              ))}
            </Section>
          )}

          {done.length > 0 && (
            <Section title={`Past (${done.length})`}>
              {done.map(t => <TaskRow key={t.id} task={t} />)}
            </Section>
          )}
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/profile" className="text-stone-500 hover:text-stone-700">Edit profile →</Link>
          <Link href="/messages" className="text-stone-500 hover:text-stone-700">Messages →</Link>
        </div>
      </div>
    )
  }

  // ── Member (worker) ───────────────────────────────────────────────────────
  const stripeOnboarded = profile.stripe_onboarded ?? false

  const { data: offers } = await supabase
    .from('offers')
    .select('id, amount, status, created_at, tasks(id, title, status, categories(name))')
    .eq('worker_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Referral counts
  const { data: referredUsers } = await supabase
    .from('users')
    .select('id, role')
    .eq('referred_by', user.id)

  const referredIds = referredUsers?.map(u => u.id) ?? []

  let qualifiedCustomers = 0
  let qualifiedMembers = 0

  if (referredIds.length > 0) {
    const customerIds = referredUsers?.filter(u => u.role === 'customer').map(u => u.id) ?? []
    const memberIds = referredUsers?.filter(u => u.role === 'worker').map(u => u.id) ?? []

    if (customerIds.length > 0) {
      const { count } = await supabase
        .from('tasks')
        .select('customer_id', { count: 'exact', head: true })
        .in('customer_id', customerIds)
        .eq('payment_status', 'released')
      qualifiedCustomers = count ?? 0
    }

    if (memberIds.length > 0) {
      const { data: qualifiedOffers } = await supabase
        .from('offers')
        .select('worker_id, tasks!inner(status)')
        .in('worker_id', memberIds)
        .eq('status', 'accepted')
        .eq('tasks.status', 'completed')
      const uniqueQualifiedMembers = new Set(qualifiedOffers?.map(o => o.worker_id))
      qualifiedMembers = uniqueQualifiedMembers.size
    }
  }

  const totalQualified = qualifiedCustomers + qualifiedMembers
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://task.coop'}/signup?ref=${user.id}`

  const activeOffers = offers?.filter(o => o.status === 'accepted' && ['assigned', 'in_progress'].includes((o.tasks as any)?.status)) ?? []
  const needsReviewOffers = offers?.filter(o => o.status === 'accepted' && (o.tasks as any)?.status === 'completed') ?? []
  const pendingOffers = offers?.filter(o => o.status === 'pending') ?? []
  const pastOffers = offers?.filter(o => o.status === 'rejected' || (o.status === 'accepted' && ['completed', 'cancelled'].includes((o.tasks as any)?.status))) ?? []

  function OfferRow({ offer }: { offer: any }) {
    const task = offer.tasks as any
    return (
      <Link href={`/tasks/${task?.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
        <div>
          <div className="font-medium text-stone-900 text-sm">{task?.title}</div>
          <div className="text-xs text-stone-400 mt-0.5">{task?.categories?.name} · {formatRelativeDate(offer.created_at)}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500">{formatCurrency(offer.amount)}</span>
          <StatusBadge status={task?.status ?? offer.status} />
        </div>
      </Link>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back, {profile.name}</h1>
          <p className="text-stone-500 text-sm mt-1">Your jobs and offers</p>
        </div>
        <Link href="/tasks" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
          Browse Tasks
        </Link>
      </div>

      {!stripeOnboarded && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-900 text-sm">Connect your bank account to get paid</p>
            <p className="text-xs text-amber-700 mt-1">You can browse tasks, but you&apos;ll need to set up payouts before submitting offers.</p>
          </div>
          <Link href="/api/stripe/connect"
            className="shrink-0 text-sm bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors font-medium">
            Set up payouts →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {activeOffers.length > 0 && (
          <Section title={`Active jobs (${activeOffers.length})`}>
            {activeOffers.map(o => <OfferRow key={o.id} offer={o} />)}
          </Section>
        )}

        {needsReviewOffers.length > 0 && (
          <Section title={`Completed — rate the customer (${needsReviewOffers.length})`}>
            {needsReviewOffers.map(o => {
              const task = o.tasks as any
              return (
                <Link key={o.id} href={`/tasks/${task?.id}/review`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{task?.title}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{task?.categories?.name} · {formatRelativeDate(o.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">{formatCurrency(o.amount)}</span>
                    <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-medium">Rate customer →</span>
                  </div>
                </Link>
              )
            })}
          </Section>
        )}

        <Section
          title={`Pending offers (${pendingOffers.length})`}
          empty={pendingOffers.length === 0 ? 'No pending offers.' : undefined}
          cta={<Link href="/tasks" className="text-xs text-emerald-600 hover:underline">Browse tasks</Link>}
        >
          {pendingOffers.map(o => <OfferRow key={o.id} offer={o} />)}
        </Section>

        {pastOffers.length > 0 && (
          <Section title={`Past (${pastOffers.length})`}>
            {pastOffers.map(o => <OfferRow key={o.id} offer={o} />)}
          </Section>
        )}
      </div>

      {/* Referral section */}
      <div className="mt-6 bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-200">
          <h2 className="font-semibold text-stone-900 text-sm">Grow the cooperative</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-stone-700 font-medium">Qualified referrals</span>
              <span className="text-sm font-semibold text-stone-900">{totalQualified} / 5</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalQualified / 5) * 100)}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-stone-400">
              <span>{qualifiedCustomers} customer{qualifiedCustomers !== 1 ? 's' : ''} who paid for a task</span>
              <span>{qualifiedMembers} member{qualifiedMembers !== 1 ? 's' : ''} who completed a job</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-2">Share your referral link. A referral counts once they post and pay for a task (customers) or complete their first job (members).</p>
            <ReferralLink url={referralUrl} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/profile" className="text-stone-500 hover:text-stone-700">Edit profile →</Link>
        <Link href={`/workers/${user.id}`} className="text-stone-500 hover:text-stone-700">View public profile →</Link>
        <Link href="/messages" className="text-stone-500 hover:text-stone-700">Messages →</Link>
      </div>
    </div>
  )
}
