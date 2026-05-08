import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TaskCard from '@/components/task-card'
import { CATEGORIES } from '@/lib/utils'

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) return { title: 'Not found' }
  return {
    title: `${cat.name} Services in Austin, TX`,
    description: `Find trusted ${cat.name.toLowerCase()} workers in Austin, TX. Browse open tasks and get offers from local member-workers. Transparent 5% fee.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) notFound()

  const supabase = await createClient()
  const { data: dbCat } = await supabase.from('categories').select('id').eq('slug', category).single()

  const { data: tasks } = dbCat ? await supabase
    .from('tasks')
    .select('id, title, description, budget, status, zip_code, created_at, categories(name, slug), users(name, avatar_url)')
    .eq('category_id', dbCat.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20) : { data: [] }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="text-3xl mb-2">{cat.icon}</div>
        <h1 className="text-3xl font-bold text-stone-900">{cat.name} in Austin, TX</h1>
        <p className="text-stone-500 mt-2">Local member-workers, transparent pricing, 5% platform fee.</p>
      </div>

      <div className="flex gap-3 mb-8">
        <Link href="/tasks/new" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
          Post a {cat.name} Task
        </Link>
        <Link href="/signup?role=worker" className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-md text-sm font-semibold hover:border-stone-500 transition-colors">
          Offer {cat.name} Services
        </Link>
      </div>

      <h2 className="font-semibold text-stone-900 mb-4">Open tasks ({tasks?.length ?? 0})</h2>
      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>No open tasks right now.</p>
          <Link href="/tasks/new" className="text-emerald-600 hover:underline text-sm mt-2 block">Be the first to post one →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tasks.map((task) => <TaskCard key={task.id} task={task as any} />)}
        </div>
      )}
    </div>
  )
}
