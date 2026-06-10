import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TaskCard from '@/components/task-card'
import TaskMapLoader from '@/components/task-map-loader'
import FilterSidebar from './filter-sidebar'

export const metadata: Metadata = {
  title: 'Browse Tasks — Austin, TX',
  description: 'Browse open tasks in Austin, TX. Find handyman, cleaning, moving, yard work, and more.',
  openGraph: {
    title: 'Browse Tasks — Austin, TX | task.coop',
    description: 'Browse open tasks in Austin, TX. Find handyman, cleaning, moving, yard work, and more.',
    url: 'https://task.coop/tasks',
    type: 'website',
  },
  alternates: { canonical: 'https://task.coop/tasks' },
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; min?: string; max?: string }>
}) {
  const { category, q, min, max } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile and category ID in parallel
  const [{ data: profile }, { data: cat }] = await Promise.all([
    user ? supabase.from('users').select('role, id_verified, id_verification_status').eq('id', user.id).single() : Promise.resolve({ data: null }),
    category ? supabase.from('categories').select('id').eq('slug', category).single() : Promise.resolve({ data: null }),
  ])

  const isWorker = profile?.role === 'worker'
  const showIdNudge = isWorker && !profile?.id_verified && profile?.id_verification_status !== 'pending'

  let query = supabase
    .from('tasks')
    .select(`
      id, title, description, budget, status, zip_code, created_at,
      categories(name, slug),
      users!customer_id(name, avatar_url)
    `)
    .eq('status', 'open')
    .eq('source', 'direct')
    .order('created_at', { ascending: false })

  if (cat) query = query.eq('category_id', (cat as any).id)
  if (q) query = query.ilike('title', `%${q}%`)
  if (min) query = query.gte('budget', Number(min))
  if (max) query = query.lte('budget', Number(max))
  // Unverified workers only see tasks that don't require verification
  if (isWorker && !profile?.id_verified) query = query.eq('require_id_verified', false)

  const { data: tasks } = await query.limit(50)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Open Tasks in Austin</h1>
          <p className="text-sm text-stone-500 mt-1">{tasks?.length ?? 0} tasks available</p>
        </div>
        {!isWorker && (
          <Link href="/tasks/new" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors self-start">
            Post a Task
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="md:w-56 shrink-0">
          <FilterSidebar category={category} q={q} min={min} max={max} />
        </aside>

        {/* Task list */}
        <div className="flex-1">
          {showIdNudge && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-amber-800">Not seeing enough tasks? Many customers require ID-verified members. <Link href="/profile" className="font-medium underline">Upload your ID</Link> to unlock more opportunities.</p>
            </div>
          )}
          {tasks && tasks.length > 0 && (
            <TaskMapLoader tasks={tasks.map(t => ({ id: t.id, title: t.title, budget: t.budget ?? null, zip_code: t.zip_code ?? null, categories: t.categories as any }))} />
          )}
          {!tasks || tasks.length === 0 ? (
            <div className="text-center py-20 text-stone-600">
              <div className="text-4xl mb-3" aria-hidden="true">📋</div>
              <div className="font-medium">No tasks found</div>
              <div className="text-sm mt-1">Try different filters{!isWorker && <> or <Link href="/tasks/new" className="text-emerald-600 hover:underline">post one yourself</Link></>}.</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
