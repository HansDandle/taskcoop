import Link from 'next/link'
import { formatCurrency, formatRelativeDate, CATEGORIES } from '@/lib/utils'
import { StarRating } from './star-rating'

type Task = {
  id: string
  title: string
  description: string
  budget: number | null
  status: string
  zip_code: string | null
  created_at: string
  categories: { name: string; slug: string } | null
  users: { name: string; avatar_url: string | null } | null
  offer_count?: number
}

export default function TaskCard({ task }: { task: Task }) {
  const cat = CATEGORIES.find(c => c.slug === task.categories?.slug)

  return (
    <Link href={`/tasks/${task.id}`} className="block bg-white border border-stone-200 rounded-lg p-5 hover:border-stone-400 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {cat && <span className="text-base">{cat.icon}</span>}
            <span className="text-xs text-stone-500 font-medium">{task.categories?.name}</span>
            {task.status !== 'open' && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                task.status === 'assigned' ? 'bg-blue-50 text-blue-700' :
                task.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                task.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                'bg-red-50 text-red-600'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-stone-900 leading-snug truncate">{task.title}</h3>
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{task.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-3">
          {task.zip_code && <span>📍 {task.zip_code}</span>}
          <span>{formatRelativeDate(task.created_at)}</span>
          {task.offer_count !== undefined && (
            <span>{task.offer_count} offer{task.offer_count !== 1 ? 's' : ''}</span>
          )}
        </div>
        {task.budget && (
          <span className="font-semibold text-stone-700">{formatCurrency(task.budget)}</span>
        )}
      </div>
    </Link>
  )
}
