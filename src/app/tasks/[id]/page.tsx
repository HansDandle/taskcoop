import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import OfferSection from './offer-section'
import TaskActions from './task-actions'
import WorkerActions from './worker-actions'
import TaskDescription from './task-description'
import SmartBack from '@/components/smart-back'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('tasks').select('title, description').eq('id', id).single()
  if (!data) return { title: 'Task not found' }
  return { title: data.title, description: data.description.slice(0, 150) }
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ posted?: string }>
}) {
  const { id } = await params
  const { posted } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: task } = await supabase
    .from('tasks')
    .select(`*, categories(name, slug), users!customer_id(id, name, avatar_url)`)
    .eq('id', id)
    .single()

  // Address fetched separately — RLS enforces owner+accepted-worker only
  const { data: taskAddress } = await supabase
    .from('task_addresses')
    .select('street, city, state')
    .eq('task_id', id)
    .single()

  if (!task) notFound()

  const { data: images } = await supabase.from('task_images').select('image_url').eq('task_id', id)

  const { data: offers } = await supabase
    .from('offers')
    .select(`id, amount, message, status, created_at, users!worker_id(id, name, avatar_url, bio)`)
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  let currentUserProfile = null
  let workerStripeReady = false
  if (user) {
    const { data } = await supabase.from('users').select('id, role, name, stripe_onboarded').eq('id', user.id).single()
    currentUserProfile = data
    workerStripeReady = !!(data?.stripe_onboarded)
  }

  const isOwner = user?.id === task.customer_id
  const isWorker = currentUserProfile?.role === 'worker'
  const hasOffered = offers?.some(o => o.users && (o.users as any).id === user?.id)
  const acceptedOffer = offers?.find(o => o.status === 'accepted')
  const isAcceptedWorker = isWorker && acceptedOffer && (acceptedOffer.users as any)?.id === user?.id

  // Address visibility: owner always, accepted worker only
  const canSeeAddress = isOwner || isAcceptedWorker

  // Auto-release: if customer didn't act within 5 days, release funds automatically
  if (
    task.payment_status === 'held' &&
    task.funds_release_at &&
    new Date(task.funds_release_at) < new Date()
  ) {
    const { releaseFunds } = await import('./actions')
    await releaseFunds(id)
  }

  // Review state
  let customerHasReviewed = false
  let workerHasReviewed = false
  if (task.status === 'completed' && user) {
    const [{ data: cr }, { data: wr }] = await Promise.all([
      supabase.from('reviews').select('id').eq('task_id', id).eq('reviewer_id', task.customer_id).maybeSingle(),
      acceptedOffer
        ? supabase.from('reviews').select('id').eq('task_id', id).eq('reviewer_id', (acceptedOffer.users as any)?.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    customerHasReviewed = !!cr
    workerHasReviewed = !!wr
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <SmartBack />
      </div>

      {posted && isOwner && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
          <p className="font-semibold text-emerald-900 text-sm">✅ Your task is live!</p>
          <p className="text-emerald-700 text-xs mt-1">
            Members in Austin can now see it and send you offers. You&apos;ll get an email as soon as the first offer comes in.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-sm text-stone-500">
              <span>{(task.categories as any)?.name}</span>
              <span>·</span>
              <span>{task.zip_code}</span>
              <span>·</span>
              <span>{formatDate(task.created_at)}</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">{task.title}</h1>
            <div className="mt-2">
              {task.worker_marked_done && task.status !== 'completed' ? (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-50 text-purple-700">
                  pending review
                </span>
              ) : (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                  task.status === 'assigned' ? 'bg-blue-50 text-blue-700' :
                  task.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                  task.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h2 className="font-semibold text-stone-900 mb-3">Task description</h2>
            <TaskDescription text={task.description} />
            {task.preferred_time && (
              <p className="text-sm text-stone-500 mt-3">Preferred time: {new Date(task.preferred_time).toLocaleString()}</p>
            )}
          </div>

          {(task.duration_estimate || task.tools_situation || task.access_situation || task.physical_requirements?.length > 0) && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="font-semibold text-stone-900 mb-4">Job logistics</h2>
              <dl className="space-y-3 text-sm">
                {task.duration_estimate && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <dt className="text-stone-600 sm:w-32 shrink-0 text-xs sm:text-sm uppercase sm:normal-case tracking-wide sm:tracking-normal">Duration</dt>
                    <dd className="text-stone-700">{({
                      under_1hr: 'Less than 1 hour',
                      '1_2hrs': '1–2 hours',
                      half_day: 'Half day (3–4 hrs)',
                      full_day: 'Full day',
                      multi_day: 'Multiple days',
                      not_sure: 'Not sure',
                    } as Record<string,string>)[task.duration_estimate] ?? task.duration_estimate}</dd>
                  </div>
                )}
                {task.tools_situation && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <dt className="text-stone-600 sm:w-32 shrink-0 text-xs sm:text-sm uppercase sm:normal-case tracking-wide sm:tracking-normal">Tools & materials</dt>
                    <dd className="text-stone-700">{({
                      just_show_up: 'All tools and materials on-site; just show up',
                      i_have_tools: 'Tools on-site; worker brings skills',
                      some_materials: "Some materials on-site; let's discuss the rest",
                      bring_everything: 'Worker should bring tools and materials',
                    } as Record<string,string>)[task.tools_situation] ?? task.tools_situation}</dd>
                  </div>
                )}
                {task.access_situation && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <dt className="text-stone-600 sm:w-32 shrink-0 text-xs sm:text-sm uppercase sm:normal-case tracking-wide sm:tracking-normal">Access</dt>
                    <dd className="text-stone-700">{({
                      someone_home: 'Someone will be home',
                      provide_code: 'Door/gate code provided',
                      unattended_ok: 'Unattended access is fine',
                      tbd: 'TBD, will coordinate',
                    } as Record<string,string>)[task.access_situation] ?? task.access_situation}</dd>
                  </div>
                )}
                {task.physical_requirements?.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <dt className="text-stone-600 sm:w-32 shrink-0 text-xs sm:text-sm uppercase sm:normal-case tracking-wide sm:tracking-normal">Physical</dt>
                    <dd className="flex flex-wrap gap-1">
                      {(task.physical_requirements as string[]).map(r => (
                        <span key={r} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{({
                          heavy_lifting: 'Heavy lifting (50+ lbs)',
                          ladder_access: 'Ladder/roof access',
                          tight_spaces: 'Tight/confined spaces',
                        } as Record<string,string>)[r] ?? r}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Address — RLS enforces owner+accepted-worker only; null for everyone else */}
          {taskAddress && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="font-semibold text-stone-900 mb-2">Job address</h2>
              <p className="text-stone-700 text-sm">{taskAddress.street}</p>
              <p className="text-stone-500 text-sm">{taskAddress.city}, {taskAddress.state} {task.zip_code}</p>
              {!isOwner && (
                <p className="text-sm text-stone-500 mt-2">Shared after offer acceptance.</p>
              )}
            </div>
          )}

          {images && images.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="font-semibold text-stone-900 mb-3">Photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <img key={i} src={img.image_url} alt={`Task photo ${i + 1}`} className="rounded-md object-cover aspect-square w-full" />
                ))}
              </div>
            </div>
          )}

          {(task.completion_photos as string[])?.length > 0 && (
            <div className="bg-white border border-emerald-200 rounded-lg p-5">
              <h2 className="font-semibold text-stone-900 mb-3">Completion photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(task.completion_photos as string[]).map((url, i) => (
                  <img key={i} src={url} alt={`Completion photo ${i + 1}`} className="rounded-md object-cover aspect-square w-full" />
                ))}
              </div>
            </div>
          )}

          <OfferSection
            task={task}
            offers={(offers ?? []) as any}
            isOwner={isOwner}
            isWorker={isWorker}
            hasOffered={hasOffered ?? false}
            currentUserId={user?.id ?? null}
            stripeReady={workerStripeReady}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            {acceptedOffer ? (
              <div className="space-y-2">
                {task.budget && (
                  <div>
                    <div className="text-xs text-stone-500 mb-0.5">Your budget</div>
                    <div className="text-lg font-semibold text-stone-400 line-through">{formatCurrency(task.budget)}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-stone-500 mb-0.5">Member agreed to</div>
                  <div className="text-2xl font-bold text-stone-900">{formatCurrency(acceptedOffer.amount)}</div>
                </div>
              </div>
            ) : task.budget ? (
              <div>
                <div className="text-xs text-stone-500 mb-1">Customer budget</div>
                <div className="text-2xl font-bold text-stone-900">{formatCurrency(task.budget)}</div>
              </div>
            ) : (
              <div className="text-sm text-stone-500">Open to offers</div>
            )}
            {!acceptedOffer && (
              <div className="mt-4 text-sm text-stone-500">
                {(offers?.length ?? 0) === 0
                  ? (isWorker ? 'Be the first to offer' : 'Members are reviewing this task')
                  : `${offers?.length} offer${offers?.length !== 1 ? 's' : ''} submitted`}
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-xs text-stone-500 mb-2">Posted by</div>
            <div className="flex items-center gap-3">
              {(task.users as any)?.avatar_url ? (
                <img src={(task.users as any).avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600">
                  {(task.users as any)?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="font-medium text-stone-900 text-sm">
                {(() => {
                  const fullName = (task.users as any)?.name ?? ''
                  if (isOwner || isAcceptedWorker) return fullName
                  const parts = fullName.split(' ')
                  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : fullName
                })()}
              </div>
            </div>
          </div>

          {isOwner && task.status === 'open' && (
            <Link
              href={`/tasks/${task.id}/edit`}
              className="block w-full text-center border border-stone-300 text-stone-700 py-2.5 rounded-md text-sm font-medium hover:border-stone-500 hover:bg-stone-50 transition-colors"
            >
              Edit task
            </Link>
          )}

          {isOwner && task.worker_marked_done && task.status !== 'completed' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-sm">
              <p className="font-semibold text-emerald-900 mb-1">The member has marked this job done</p>
              <p className="text-emerald-700 text-xs mb-3">Review any completion photos below, then click the button to release payment and rate the member.</p>
            </div>
          )}

          {isOwner && (
            <TaskActions taskId={task.id} status={task.status} />
          )}

          {isAcceptedWorker && (
            <WorkerActions
              taskId={task.id}
              status={task.status}
              workerMarkedDone={task.worker_marked_done ?? false}
              existingPhotos={(task.completion_photos as string[]) ?? []}
            />
          )}

          {/* Review prompts — shown after completion */}
          {task.status === 'completed' && isOwner && !customerHasReviewed && (
            <Link
              href={`/tasks/${task.id}/review`}
              className="block w-full text-center bg-emerald-600 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Rate the member
            </Link>
          )}
          {task.status === 'completed' && isOwner && customerHasReviewed && (
            <div className="text-sm text-center text-stone-500">You've left a review. Thanks.</div>
          )}
          {task.status === 'completed' && isAcceptedWorker && !workerHasReviewed && (
            <Link
              href={`/tasks/${task.id}/review`}
              className="block w-full text-center bg-emerald-600 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Rate the customer
            </Link>
          )}
          {task.status === 'completed' && isAcceptedWorker && workerHasReviewed && (
            <div className="text-sm text-center text-stone-500">You've left a review. Thanks.</div>
          )}
        </div>
      </div>
    </div>
  )
}
