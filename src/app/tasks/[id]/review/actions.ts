'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const task_id = formData.get('task_id') as string
  const reviewee_id = formData.get('reviewee_id') as string
  const rating = Number(formData.get('rating'))
  const comment = (formData.get('comment') as string).trim() || null

  if (!task_id || !reviewee_id || rating < 1 || rating > 5) return { error: 'Invalid review data.' }

  const { error } = await supabase.from('reviews').insert({
    task_id,
    reviewer_id: user.id,
    reviewee_id,
    rating,
    comment,
  })

  if (error) return { error: 'Failed to submit review.' }
}
