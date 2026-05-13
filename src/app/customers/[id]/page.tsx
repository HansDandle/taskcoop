import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StarRating } from '@/components/star-rating'
import { formatDate } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('name').eq('id', id).single()
  if (!data) return { title: 'Member not found' }
  return { title: `${data.name} — task.coop` }
}

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/customers/${id}`)

  const { data: customer } = await supabase
    .from('users')
    .select('id, name, avatar_url, role, created_at, suspended')
    .eq('id', id)
    .single()

  if (!customer || (customer as any).suspended) notFound()

  const [
    { data: tasks },
    { data: reviews },
    { count: totalTaskCount },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, status, created_at, categories(name)')
      .eq('customer_id', id)
      .in('status', ['open', 'assigned', 'in_progress', 'completed'])
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users!reviewer_id(name)')
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', id),
  ])

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/tasks" className="text-sm text-stone-500 hover:text-stone-700 block mb-6">← Back</Link>

      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-5">
          {customer.avatar_url ? (
            <img src={customer.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center text-2xl font-bold text-stone-600">
              {customer.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-stone-900">{customer.name}</h1>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">Customer</span>
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={avgRating} />
                <span className="text-sm text-stone-500">{avgRating.toFixed(1)} ({reviews?.length} review{reviews?.length !== 1 ? 's' : ''})</span>
              </div>
            )}
            <div className="text-sm text-stone-500">Member since {formatDate(customer.created_at)}</div>
            {(totalTaskCount ?? 0) > 0 && (
              <div className="text-sm text-stone-500">{totalTaskCount} task{totalTaskCount !== 1 ? 's' : ''} posted</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="mb-8">
        <h2 className="font-semibold text-stone-900 mb-4">Recent tasks</h2>
        {!tasks || tasks.length === 0 ? (
          <p className="text-stone-500 text-sm">No tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white border border-stone-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-900 truncate">{task.title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {(task.categories as any)?.name} · {formatDate(task.created_at)}
                  </div>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                  task.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews received */}
      <div>
        <h2 className="font-semibold text-stone-900 mb-4">Reviews ({reviews?.length ?? 0})</h2>
        {!reviews || reviews.length === 0 ? (
          <p className="text-stone-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-stone-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-stone-500">{formatDate(review.created_at)}</span>
                  <span className="text-xs text-stone-500 ml-auto">by {(review.users as any)?.name?.split(' ')[0] ?? 'Member'}</span>
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
