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

    // Fetch pending offer counts for open tasks
    const openIds = open.map(t => t.id)
    const { data: pendingOffers } = openIds.length > 0
      ? await supabase.from('offers').select('task_id').in('task_id', openIds).eq('status', 'pending')
      : { data: [] }

    const offerCountByTask: Record<string, number> = {}
    for (const o of pendingOffers ?? []) {
      offerCountByTask[o.task_id] = (offerCountByTask[o.task_id] ?? 0) + 1
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
                  <span className="text-emerald-800 truncate">{t.title}</span>
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
  const pastOffers = offers?.filter(o => o.status === 'rejected' || (o.status === 'accepted' && ['completed', 'cancelled'].includes((o.tasks as any)?.status))) ?? []

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
    return (
      <Link href={`/tasks/${task?.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
        <div>
          <div className="font-medium text-stone-900 text-sm">{task?.title}</div>
          <div className="text-xs text-stone-500 mt-0.5">{task?.categories?.name} · {formatRelativeDate(offer.created_at)}</div>
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

      {welcome && stripeOnboarded && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
          <p className="font-semibold text-emerald-900 text-sm">Welcome{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}! Your account is ready.</p>
          <p className="text-emerald-700 text-sm mt-1">Browse open tasks below and send offers on ones that fit your skills.</p>
        </div>
      )}

      {!stripeOnboarded && (
        <div className="mb-6 bg-white border border-stone-200 rounded-lg px-6 py-8 text-center">
          <div className="text-3xl mb-3" aria-hidden="true">💳</div>
          <h2 className="font-semibold text-stone-900 mb-1">Set up payouts to start earning</h2>
          <p className="text-stone-500 text-sm mb-5 max-w-sm mx-auto">Connect your bank account through Stripe so you can receive payment when jobs are complete. Takes about 2 minutes.</p>
          <Link href="/api/stripe/connect"
            className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Set up payouts →
          </Link>
          <p className="text-sm text-stone-500 mt-4">You can browse tasks in the meantime, but you&apos;ll need this before submitting offers.</p>
        </div>
      )}

      {(() => {
        const status = (profile as any).id_verification_status
        const hasSelfie = !!(profile as any).id_selfie_url
        // Three cases worth surfacing on the dashboard:
        //   - never submitted (no doc, no status)
        //   - rejected (must resubmit)
        //   - legacy approval: id_verified true but no selfie on file (pre-expansion)
        const neverSubmitted = !(profile as any).id_document_url && !status
        const rejected = status === 'rejected'
        const legacy = (profile as any).id_verified && !hasSelfie
        if (!neverSubmitted && !rejected && !legacy) return null
        return (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden="true">🪪</div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 text-sm">
                  {rejected ? 'Your ID submission was rejected'
                    : legacy ? 'Add a selfie to keep your verified badge'
                    : 'Verify your identity to win more jobs'}
                </p>
                <p className="text-amber-800 text-sm mt-1">
                  {rejected
                    ? 'Re-upload a clearer photo of your ID and a selfie holding it.'
                    : legacy
                    ? 'We now ask every verified member for a selfie holding their ID. Upload one to stay verified.'
                    : 'Upload a photo of your ID, a selfie holding it, and any professional licenses. Customers strongly prefer ID-verified members.'}
                </p>
                <Link href="/profile" className="inline-block mt-2 text-xs font-semibold text-amber-900 underline">
                  Go to verification →
                </Link>
              </div>
            </div>
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

        {(nextdoorLeads?.length ?? 0) > 0 && (
          <Section
            title="Nextdoor leads"
            cta={<Link href="/nextdoor" className="text-xs text-emerald-600 hover:underline">Browse feed</Link>}
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
                        <a href={lead.external_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          · Nextdoor post
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
