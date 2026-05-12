import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TaskForm from './task-form'

export const metadata: Metadata = { title: 'Post a Task' }

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/tasks/new')

  const { data: profile } = await supabase.from('users').select('role, name').eq('id', user.id).single()
  if (profile?.role !== 'customer') redirect('/dashboard')

  const [{ data: categories }, { data: addresses }, { welcome }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('customer_addresses').select('*').eq('user_id', user.id).order('created_at'),
    searchParams,
  ])

  const firstName = profile?.name?.split(' ')[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {welcome && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
          <p className="font-semibold text-emerald-900 text-sm">Welcome{firstName ? `, ${firstName}` : ''}! Your account is ready.</p>
          <p className="text-emerald-700 text-xs mt-1">Describe what you need below and local members will send you offers — usually within a few hours.</p>
        </div>
      )}
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Post a task</h1>
      <p className="text-stone-500 text-sm mb-8">Describe what you need and local members will send you offers.</p>
      <TaskForm categories={categories ?? []} userId={user.id} savedAddresses={addresses ?? []} />
    </div>
  )
}
