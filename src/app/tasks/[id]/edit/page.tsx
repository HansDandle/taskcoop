import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EditTaskForm from './edit-task-form'

export const metadata: Metadata = { title: 'Edit Task' }

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/tasks/${id}/edit`)

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (!task) notFound()
  if (task.customer_id !== user.id) redirect(`/tasks/${id}`)

  const [{ data: images }, { data: categories }, { data: addresses }] = await Promise.all([
    supabase.from('task_images').select('image_url').eq('task_id', id),
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('customer_addresses').select('*').eq('user_id', user.id).order('created_at'),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Edit task</h1>
      <p className="text-stone-500 text-sm mb-8">Update your task details, add photos, or adjust the budget.</p>
      <EditTaskForm
        task={task}
        existingImages={images?.map(i => i.image_url) ?? []}
        categories={categories ?? []}
        userId={user.id}
        savedAddresses={addresses ?? []}
      />
    </div>
  )
}
