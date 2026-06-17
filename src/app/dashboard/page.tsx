import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/urls'
import ReferralGrid from '@/components/referral-grid'
import BadgeList from '@/components/badge-list'
import { computeBadges } from '@/lib/badges'
import InstallTile from '@/components/install-tile'
import PushToggle from '@/components/push-toggle'
import CopyButton from '@/components/copy-button'
import { saveReplyTemplate } from './actions'
import DeleteOfferButton from './delete-offer-button'
import DismissLeadButton from './dismiss-lead-button'

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
        <div className="text-xs text-stone-500 mt-0.5">{task.categories?.name} · {formatRelativeDate(task.created_at)}</div>
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
        <div className="px-5 py-6 text-sm text-stone-500 text-center">{empty}</div>
      ) : (
        <div className="divide-y divide-stone-100">{children}</div>
      )}
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string; welcome?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  if (!profile || profile.role === 'admin') redirect('/admin')

  // If returning from Stripe Connect onboarding, sync the account status.
  // charges_enabled is the canonical signal that the connected account can receive payments,
  // matching what the account.updated webhook keys off of.
  const { stripe: stripeParam, welcome } = await searchParams
  if (stripeParam === 'connected' && profile.stripe_account_id && !profile.stripe_onboarded) {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)
    if (account.charges_enabled) {
      await supabase.from('users').update({ stripe_onboarded: true }).eq('id', user.id)
      profile.stripe_onboarded = true
    }
  }

  // ── Customer ──────────────────────────────────────────────────────────────
  if (profile.role === 'customer') {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, budget, created_at, categories(name), worker_marked_done')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const open = tasks?.filter(t => t.status === 'open') ?? []
    const pendingReview = tasks?.filter(t => (t as any).worker_marked_done && t.status !== 'completed') ?? []
    const active = tasks?.filter(t => ['assigned', 'in_progress'].includes(t.status) && !(t as any).worker_marked_done) ?? []
    const needsReview = tasks?.filter(t => t.status === 'completed') ?? []
    const done = tasks?.filter(t => ['completed', 'cancelled'].includes(t.status)) ?? []

    // Fetch pending offer counts (and timing) for open tasks
    const openIds = open.map(t => t.id)
    const { data: pendingOffers } = openIds.length > 0
      ? await supabase.from('offers').select('task_id, created_at').in('task_id', openIds).eq('status', 'pending')
      : { data: [] }

    const offerCountByTask: Record<string, number> = {}
    const latestOfferByTask: Record<string, string> = {}
    for (const o of pendingOffers ?? []) {
      offerCountByTask[o.task_id] = (offerCountByTask[o.task_id] ?? 0) + 1
      if (!latestOfferByTask[o.task_id] || o.created_at > latestOfferByTask[o.task_id]) {
        latestOfferByTask[o.task_id] = o.created_at
      }
    }
    const tasksWithOffers = open.filter(t => offerCountByTask[t.id] > 0)
    const totalNewOffers = Object.values(offerCountByTask).reduce((s, n) => s + n, 0)

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

        {tasks?.length === 0 && (
          <div className="mb-6 bg-white border border-stone-200 rounded-lg px-6 py-8 text-center">
            <div className="text-3xl mb-3" aria-hidden="true">📋</div>
            <h2 className="font-semibold text-stone-900 mb-1">Post your first task</h2>
            <p className="text-stone-500 text-sm mb-5 max-w-sm mx-auto">Describe what you need and local members will send you offers, usually within a few hours. Free to post.</p>
            <Link href="/tasks/new" className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
              Post a Task
            </Link>
          </div>
        )}

        {totalNewOffers > 0 && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
            <p className="font-semibold text-emerald-900 text-sm mb-2">
              🎉 You have {totalNewOffers} new offer{totalNewOffers !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {tasksWithOffers.map(t => (
                <Link key={t.id} href={`/tasks/${t.id}`} className="flex items-center justify-between text-sm hover:opacity-80">
                  <span className="min-w-0">
                    <span className="text-emerald-800 truncate block">{t.title}</span>
                    {latestOfferByTask[t.id] && (
                      <span className="text-xs text-emerald-700/70">latest offer {formatRelativeDate(latestOfferByTask[t.id])}</span>
                    )}
                  </span>
                  <span className="shrink-0 ml-3 bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {offerCountByTask[t.id]} offer{offerCountByTask[t.id] !== 1 ? 's' : ''} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {pendingReview.length > 0 && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg px-5 py-4">
            <p className="font-semibold text-purple-900 text-sm mb-2">
              Your member has marked {pendingReview.length === 1 ? 'a job' : 'jobs'} as done
            </p>
            <div className="space-y-1">
              {pendingReview.map(t => (
                <Link key={t.id} href={`/tasks/${t.id}`} className="flex items-center justify-between text-sm hover:opacity-80">
                  <span className="text-purple-800 truncate">{t.title}</span>
                  <span className="shrink-0 ml-3 bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Review and release payment →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

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
            {open.map(t => (
              <div key={t.id} className="relative">
                <TaskRow task={t} />
                {offerCountByTask[t.id] > 0 && (
                  <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {offerCountByTask[t.id]} new
                  </span>
                )}
              </div>
            ))}
          </Section>

          {needsReview.length > 0 && (
            <Section title={`Completed: rate your member (${needsReview.length})`}>
              {needsReview.map(t => (
                <Link key={t.id} href={`/tasks/${t.id}/review`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{t.title}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{(t as any).categories?.name} · {formatRelativeDate(t.created_at)}</div>
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

        <div className="mt-6 flex gap-3">
          <Link href="/profile" className="border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:border-stone-500 hover:bg-stone-50 transition-colors">Edit profile</Link>
          <Link href="/messages" className="border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:border-stone-500 hover:bg-stone-50 transition-colors">Messages</Link>
        </div>

        <div className="mt-6 space-y-3">
          <InstallTile />
          <PushToggle />
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

  // Nextdoor leads — task stubs this worker sourced that haven't been claimed yet
  const { data: nextdoorLeads } = await supabase
    .from('tasks')
    .select('id, title, created_at, claim_token, external_url, customer_id, offers(amount)')
    .eq('source', 'nextdoor')
    .eq('sourced_by_worker_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Referral slots — generate lazily if none exist
  let { data: referralSlots } = await supabase
    .from('referral_slots')
    .select('category, slot_number, code, referred_user_id')
    .eq('referrer_id', user.id)
    .order('category').order('slot_number')

  if (!referralSlots || referralSlots.length === 0) {
    const { generateSlotsForUser } = await import('@/lib/referral-slots')
    await generateSlotsForUser(user.id)
    const { data: fresh } = await supabase
      .from('referral_slots')
      .select('category, slot_number, code, referred_user_id')
      .eq('referrer_id', user.id)
      .order('category').order('slot_number')
    referralSlots = fresh ?? []
  }

  const activeOffers = offers?.filter(o => o.status === 'accepted' && ['assigned', 'in_progress'].includes((o.tasks as any)?.status)) ?? []
  const needsReviewOffers = offers?.filter(o => o.status === 'accepted' && (o.tasks as any)?.status === 'completed') ?? []
  const pendingOffers = offers?.filter(o => o.status === 'pending') ?? []
  const pastOffers = offers?.filter(o => o.status === 'rejected' || o.status === 'withdrawn' || (o.status === 'accepted' && ['completed', 'cancelled'].includes((o.tasks as any)?.status))) ?? []

  // Badges
  const completedOffers = offers?.filter(o => o.status === 'accepted' && (o.tasks as any)?.status === 'completed') ?? []
  const completedJobsByCategory: Record<string, number> = {}
  for (const o of completedOffers) {
    const cat = (o.tasks as any)?.categories?.name
    if (cat) completedJobsByCategory[cat] = (completedJobsByCategory[cat] ?? 0) + 1
  }
  const { data: reviewRows } = await supabase.from('reviews').select('rating').eq('reviewee_id', user.id)
  const memberAvgRating = reviewRows?.length ? reviewRows.reduce((s, r) => s + r.rating, 0) / reviewRows.length : null

  const badges = computeBadges({
    idVerified: profile.id_verified ?? false,
    stripeOnboarded: profile.stripe_onboarded ?? false,
    createdAt: profile.created_at,
    completedJobCount: completedOffers.length,
    avgRating: memberAvgRating,
    reviewCount: reviewRows?.length ?? 0,
    referralSlots: referralSlots ?? [],
    completedJobsByCategory,
  })

  function OfferRow({ offer }: { offer: any }) {
    const task = offer.tasks as any
    const isPending = offer.status === 'pending'
    return (
      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
        <Link href={`/tasks/${task?.id}`} className="flex-1 min-w-0">
          <div className="font-medium text-stone-900 text-sm">{task?.title}</div>
          <div className="text-xs text-stone-500 mt-0.5">{task?.categories?.name} · {formatRelativeDate(offer.created_at)}</div>
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-stone-500">{formatCurrency(offer.amount)}</span>
          <StatusBadge status={task?.status ?? offer.status} />
          {isPending && <DeleteOfferButton offerId={offer.id} />}
        </div>
      </div>
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

      {welcome && stripeOnboarded && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
          <p className="font-semibold text-emerald-900 text-sm">Welcome{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}! Your account is ready.</p>
          <p className="text-emerald-700 text-sm mt-1">Browse open tasks below and send offers on ones that fit your skills.</p>
        </div>
      )}

      {(() => {
        // Single "steps to start earning" checklist, replacing the separate
        // payout/ID banners. Hidden once both steps are done.
        const idStatus = (profile as any).id_verification_status as string | null
        const idDone = !!profile.id_verified
        const idPending = idStatus === 'pending' && !idDone
        const idRejected = idStatus === 'rejected'

        const steps = [
          {
            key: 'verify',
            title: 'Verify your identity',
            done: idDone,
            pending: idPending,
            desc: idDone ? 'Your verified badge is active.'
              : idPending ? "Under review. We'll email you when you're approved."
              : idRejected ? 'Your last submission needs another try.'
              : 'Upload your ID and a selfie. Verified members win more jobs.',
            href: '/verify',
            cta: idRejected ? 'Resubmit →' : 'Verify →',
          },
          {
            key: 'payouts',
            title: 'Connect payouts',
            done: stripeOnboarded,
            pending: false,
            desc: stripeOnboarded ? 'You can receive payments.'
              : 'Connect your bank through Stripe so you can get paid. Takes about 2 minutes.',
            href: '/api/stripe/connect',
            cta: 'Set up →',
          },
        ]
        const doneCount = steps.filter(s => s.done).length
        if (doneCount === steps.length) return null

        return (
          <div className="mb-6 bg-white border border-stone-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900 text-sm">Get set up to start earning</h2>
              <span className="text-xs text-stone-500">{doneCount} of {steps.length} done</span>
            </div>
            <ol className="divide-y divide-stone-100">
              {steps.map((s, i) => (
                <li key={s.key} className="flex items-center gap-3 px-5 py-4">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    s.done ? 'bg-emerald-600 text-white'
                    : s.pending ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-200 text-stone-600'
                  }`}>
                    {s.done ? '✓' : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${s.done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{s.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{s.desc}</p>
                  </div>
                  {!s.done && !s.pending && (
                    <Link href={s.href}
                      className="shrink-0 bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-emerald-700 transition-colors">
                      {s.cta}
                    </Link>
                  )}
                  {s.pending && <span className="shrink-0 text-xs text-amber-600 font-medium">Pending</span>}
                </li>
              ))}
            </ol>
          </div>
        )
      })()}

      <div className="space-y-4">
        {activeOffers.length > 0 && (
          <Section title={`Active jobs (${activeOffers.length})`}>
            {activeOffers.map(o => <OfferRow key={o.id} offer={o} />)}
          </Section>
        )}

        {needsReviewOffers.length > 0 && (
          <Section title={`Completed: rate the customer (${needsReviewOffers.length})`}>
            {needsReviewOffers.map(o => {
              const task = o.tasks as any
              return (
                <Link key={o.id} href={`/tasks/${task?.id}/review`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{task?.title}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{task?.categories?.name} · {formatRelativeDate(o.created_at)}</div>
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

        {stripeOnboarded && activeOffers.length === 0 && pendingOffers.length === 0 && pastOffers.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-lg px-6 py-8 text-center">
            <div className="text-3xl mb-3" aria-hidden="true">🔍</div>
            <h2 className="font-semibold text-stone-900 mb-1">Find your first job</h2>
            <p className="text-stone-500 text-sm mb-5 max-w-sm mx-auto">Browse open tasks posted by customers in Austin and send an offer on anything that fits your skills.</p>
            <Link href="/tasks" className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
              Browse open tasks
            </Link>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4 flex items-start gap-4">
          <div className="text-2xl shrink-0" aria-hidden="true">🔍</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-900 text-sm">Find more leads with the browser extension</p>
            <p className="text-emerald-800 text-sm mt-1">
              The TaskCoop Lead Finder watches Nextdoor, Facebook, Craigslist, and Reddit as you browse and flags task requests automatically. When you spot one, send them to the Lead Feed and generate your offer reply in seconds.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <a
                href="https://chromewebstore.google.com/detail/taskcoop-lead-finder/plgjlgbkgjkijoblifahbdohgfpnkmeh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-emerald-600 text-white text-sm px-4 py-2 rounded-md font-semibold hover:bg-emerald-700 transition-colors"
              >
                Add to Chrome, it&apos;s free
              </a>
              <a
                href="https://addons.mozilla.org/en-US/firefox/addon/taskcoop-lead-finder/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-stone-800 text-white text-sm px-4 py-2 rounded-md font-semibold hover:bg-stone-900 transition-colors"
              >
                Add to Firefox, it&apos;s free
              </a>
            </div>
          </div>
        </div>

        {(nextdoorLeads?.length ?? 0) > 0 && (
          <Section
            title="Sourced leads"
          >
            {(nextdoorLeads ?? []).map(lead => {
              const pending = lead.customer_id === null
              const offerAmount = (lead.offers as any)?.[0]?.amount
              const claimUrl = pending && lead.claim_token
                ? `${APP_URL}/tasks/${lead.id}?claim=${lead.claim_token}`
                : null
              return (
                <div key={lead.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/tasks/${lead.id}`} className="font-medium text-stone-900 text-sm hover:underline truncate block">
                      {lead.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                      <span>{formatRelativeDate(lead.created_at)}</span>
                      {offerAmount && <span>· ${offerAmount}</span>}
                      {lead.external_url && (
                        <a href={lead.external_url.replace('nextdoor.com/search/?', 'nextdoor.com/search/posts/?')} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          · Original post
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pending ? (
                      <>
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          awaiting response
                        </span>
                        {claimUrl && <CopyButton text={claimUrl} label="Copy link" />}
                        <DismissLeadButton taskId={lead.id} />
                      </>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        converted
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </Section>
        )}

        {profile.role === 'worker' && (
          <details className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <summary className="px-5 py-4 cursor-pointer list-none flex items-center justify-between">
              <span className="font-semibold text-stone-900 text-sm">Offer reply template</span>
              <span className="text-xs text-stone-400">Customize</span>
            </summary>
            <form action={saveReplyTemplate} className="px-5 pb-5 space-y-3">
              <p className="text-xs text-stone-500">
                Variables: <code className="bg-stone-100 px-1 rounded">{'{'+'url}'}</code> <code className="bg-stone-100 px-1 rounded">{'{'+'price}'}</code> <code className="bg-stone-100 px-1 rounded">{'{'+'bio}'}</code> <code className="bg-stone-100 px-1 rounded">{'{'+'verified}'}</code> <code className="bg-stone-100 px-1 rounded">{'{'+'message}'}</code>
              </p>
              <textarea
                name="reply_template"
                rows={6}
                defaultValue={profile.reply_template ?? ''}
                placeholder={`Book me: {url}\n\nI'm {bio} and I'll do it for {price}. Payment is escrowed — you pay nothing until you mark the job complete.{verified}{message}`}
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors"
                >
                  Save template
                </button>
                <span className="text-xs text-stone-400">Leave blank to use the default.</span>
              </div>
            </form>
          </details>
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

      {/* Quick links */}
      <div className="mt-6 flex gap-3">
        <Link href="/profile" className="border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:border-stone-500 hover:bg-stone-50 transition-colors">Edit profile</Link>
        <Link href={`/workers/${user.id}`} className="border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:border-stone-500 hover:bg-stone-50 transition-colors">Public profile</Link>
        <Link href="/messages" className="border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:border-stone-500 hover:bg-stone-50 transition-colors">Messages</Link>
        <Link href="/extension" className="border border-emerald-300 text-emerald-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 transition-colors">Get Lead Finder extension</Link>
      </div>

      <div className="mt-6 space-y-3">
        <InstallTile />
        <PushToggle />
      </div>

      {/* Badges */}
      <div className="mt-6 bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-200">
          <h2 className="font-semibold text-stone-900 text-sm">Badges</h2>
        </div>
        <div className="px-5 py-4">
          <BadgeList badges={badges} showUnearned />
        </div>
      </div>

      {/* Referral section */}
      <div className="mt-6 bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-200">
          <h2 className="font-semibold text-stone-900 text-sm">Grow the cooperative</h2>
          <p className="text-sm text-stone-500 mt-0.5">You have 25 unique invite links, 5 per category. Fill a row to earn Team Builder. Fill all 25 for Full Roster.</p>
        </div>
        <div className="px-5 py-4">
          <ReferralGrid slots={referralSlots ?? []} baseUrl={APP_URL} firstName={profile.name?.split(' ')[0] ?? 'A member'} />
        </div>
      </div>

    </div>
  )
}
