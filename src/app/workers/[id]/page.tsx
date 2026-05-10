import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StarRating } from '@/components/star-rating'
import { formatDate } from '@/lib/utils'
import MarkdownBio from '@/components/markdown-bio'
import BadgeList from '@/components/badge-list'
import { computeBadges } from '@/lib/badges'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('name, bio').eq('id', id).single()
  if (!data) return { title: 'Member not found' }
  return { title: `${data.name} — task.coop`, description: data.bio ?? undefined }
}

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: worker } = await supabase
    .from('users')
    .select('id, name, bio, avatar_url, role, created_at, id_verified, stripe_onboarded, suspended')
    .eq('id', id)
    .single()

  if (!worker || worker.role !== 'worker' || (worker as any).suspended) notFound()

  const [
    { data: reviews },
    { data: acceptedOffers },
    { data: referredUsers },
  ] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users!reviewer_id(name)')
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('offers')
      .select('task_id, tasks!inner(status, categories(name))')
      .eq('worker_id', id)
      .eq('status', 'accepted')
      .eq('tasks.status', 'completed'),
    supabase
      .from('users')
      .select('id, role')
      .eq('referred_by', id),
  ])

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  const completedJobCount = acceptedOffers?.length ?? 0

  const completedJobsByCategory: Record<string, number> = {}
  for (const offer of acceptedOffers ?? []) {
    const catName = (offer.tasks as any)?.categories?.name
    if (catName) completedJobsByCategory[catName] = (completedJobsByCategory[catName] ?? 0) + 1
  }

  // Compute qualified referrals for badge purposes
  const referredIds = referredUsers?.map(u => u.id) ?? []
  let qualifiedReferrals = 0
  if (referredIds.length > 0) {
    const customerIds = referredUsers?.filter(u => u.role === 'customer').map(u => u.id) ?? []
    const memberIds = referredUsers?.filter(u => u.role === 'worker').map(u => u.id) ?? []
    let qc = 0, qm = 0
    if (customerIds.length > 0) {
      const { count } = await supabase.from('tasks').select('customer_id', { count: 'exact', head: true }).in('customer_id', customerIds).eq('payment_status', 'released')
      qc = count ?? 0
    }
    if (memberIds.length > 0) {
      const { data: qOffers } = await supabase.from('offers').select('worker_id, tasks!inner(status)').in('worker_id', memberIds).eq('status', 'accepted').eq('tasks.status', 'completed')
      qm = new Set(qOffers?.map(o => o.worker_id)).size
    }
    qualifiedReferrals = qc + qm
  }

  const badges = computeBadges({
    idVerified: (worker as any).id_verified ?? false,
    stripeOnboarded: (worker as any).stripe_onboarded ?? false,
    createdAt: worker.created_at,
    completedJobCount,
    avgRating,
    reviewCount: reviews?.length ?? 0,
    qualifiedReferrals,
    completedJobsByCategory,
  })

  const earnedBadges = badges.filter(b => b.earned)

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === worker.id

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={isOwnProfile ? '/dashboard' : '/tasks'} className="text-sm text-stone-500 hover:text-stone-700 block mb-6">← Back</Link>

      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-5">
          {worker.avatar_url ? (
            <img src={worker.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center text-2xl font-bold text-stone-600">
              {worker.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-stone-900">{worker.name}</h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Member</span>
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={avgRating} />
                <span className="text-sm text-stone-500">{avgRating.toFixed(1)} ({reviews?.length} reviews)</span>
              </div>
            )}
            <div className="text-xs text-stone-400">Member since {formatDate(worker.created_at)}</div>
            {completedJobCount > 0 && (
              <div className="text-xs text-stone-400">{completedJobCount} job{completedJobCount !== 1 ? 's' : ''} completed</div>
            )}
          </div>
        </div>

        {worker.bio && (
          <div className="mt-5">
            <MarkdownBio content={worker.bio} className="text-stone-600" />
          </div>
        )}

        {earnedBadges.length > 0 && (
          <div className="mt-5 pt-5 border-t border-stone-100">
            <BadgeList badges={earnedBadges} />
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-semibold text-stone-900 mb-4">Reviews ({reviews?.length ?? 0})</h2>
        {!reviews || reviews.length === 0 ? (
          <p className="text-stone-400 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-stone-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-stone-400">{formatDate(review.created_at)}</span>
                  <span className="text-xs text-stone-500 ml-auto">by {(review.users as any)?.name}</span>
                </div>
                {review.comment && <p className="text-sm text-stone-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
