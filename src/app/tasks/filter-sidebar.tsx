'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { CATEGORIES } from '@/lib/utils'

export default function FilterSidebar({
  category,
  q,
  min,
  max,
}: {
  category?: string
  q?: string
  min?: string
  max?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(q ?? '')

  // Debounce search input
  useEffect(() => {
    if (search === (q ?? '')) return
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set('q', search)
      else params.delete('q')
      startTransition(() => router.replace(`${pathname}?${params.toString()}`))
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  const hasFilters = category || q || min || max

  return (
    <div className={isPending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      <div className="space-y-5">
        <div>
          <label htmlFor="filter-search" className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Search</label>
          <input
            id="filter-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. fence repair"
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <div className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2" id="budget-label">Budget</div>
          <div className="flex gap-2" role="group" aria-labelledby="budget-label">
            <input
              id="budget-min"
              defaultValue={min}
              onBlur={(e) => update('min', e.target.value)}
              placeholder="Min $"
              type="number"
              min="0"
              aria-label="Minimum budget"
              className="w-full border border-stone-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              id="budget-max"
              defaultValue={max}
              onBlur={(e) => update('max', e.target.value)}
              placeholder="Max $"
              type="number"
              min="0"
              aria-label="Maximum budget"
              className="w-full border border-stone-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        {hasFilters && (
          <Link href="/tasks" className="block text-center text-sm text-stone-500 hover:text-stone-700">
            Clear filters
          </Link>
        )}
      </div>

      {/* Category quick-links */}
      <div className="mt-8">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Categories</div>
        <div className="space-y-1">
          <Link
            href="/tasks"
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${!category ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            All categories
          </Link>
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
    </div>
  )
}
