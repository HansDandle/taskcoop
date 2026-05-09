import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from './review-form'

export const metadata: Metadata = { title: 'Leave a Review' }

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, status, customer_id')
    .eq('id', id)
    .single()

  if (!task || task.status !== 'completed') notFound()

  // Find who to review
  let revieweeId: string | null = null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

  if (profile?.role === 'customer' && task.customer_id === user.id) {
    const { data: offer } = await supabase
      .from('offers')
      .select('worker_id')
      .eq('task_id', id)
      .eq('status', 'accepted')
      .single()
    revieweeId = offer?.worker_id ?? null
  } else if (profile?.role === 'worker') { // member in UI, worker in DB
    revieweeId = task.customer_id
  }

  if (!revieweeId) redirect(`/tasks/${id}`)

  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('task_id', id)
    .eq('reviewer_id', user.id)
    .single()

  if (existing) redirect(`/tasks/${id}`)

  const { data: reviewee } = await supabase.from('users').select('name').eq('id', revieweeId).single()

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Leave a review</h1>
      <p className="text-stone-500 text-sm mb-8">Rate your experience with {reviewee?.name} on "{task.title}"</p>
      <ReviewForm taskId={id} revieweeId={revieweeId} revieweeName={reviewee?.name ?? ''} />
    </div>
  )
}
