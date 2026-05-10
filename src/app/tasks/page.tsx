import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TaskCard from '@/components/task-card'
import { CATEGORIES } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Browse Tasks — Austin, TX',
  description: 'Browse open tasks in Austin, TX. Find handyman, cleaning, moving, yard work, and more.',
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
    user ? supabase.from('users').select('role').eq('id', user.id).single() : Promise.resolve({ data: null }),
    category ? supabase.from('categories').select('id').eq('slug', category).single() : Promise.resolve({ data: null }),
  ])

  const isWorker = profile?.role === 'worker'

  let query = supabase
    .from('tasks')
    .select(`
      id, title, description, budget, status, zip_code, created_at,
      categories(name, slug),
      users(name, avatar_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (cat) query = query.eq('category_id', (cat as any).id)
  if (q) query = query.ilike('title', `%${q}%`)
  if (min) query = query.gte('budget', Number(min))
  if (max) query = query.lte('budget', Number(max))

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
          <form className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Search</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="e.g. fence repair"
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Category</label>
              <select
                name="category"
                defaultValue={category ?? ''}
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Budget</label>
              <div className="flex gap-2">
                <input name="min" defaultValue={min} placeholder="Min $" type="number" min="0" className="w-full border border-stone-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input name="max" defaultValue={max} placeholder="Max $" type="number" min="0" className="w-full border border-stone-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-stone-900 text-white py-2 rounded-md text-sm font-medium hover:bg-stone-800 transition-colors">
              Apply filters
            </button>
            {(category || q || min || max) && (
              <Link href="/tasks" className="block text-center text-sm text-stone-500 hover:text-stone-700">
                Clear filters
              </Link>
            )}
          </form>

          {/* Category quick-links */}
          <div className="mt-8">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Categories</div>
            <div className="space-y-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/tasks?category=${c.slug}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${category === c.slug ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  <span>{c.icon}</span> {c.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Task list */}
        <div className="flex-1">
          {!tasks || tasks.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <div className="text-4xl mb-3">📋</div>
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
