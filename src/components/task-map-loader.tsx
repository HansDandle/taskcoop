'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

type Task = {
  id: string
  title: string
  budget: number | null
  zip_code: string | null
  categories: { name: string; slug: string } | null
}

const TaskMap = dynamic(() => import('./task-map'), {
  ssr: false,
  loading: () => <div className="w-full h-72 rounded-lg bg-stone-100 animate-pulse mb-6" />,
})

export default function TaskMapLoader({ tasks }: { tasks: Task[] }) {
  const [isMobile, setIsMobile] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (isMobile && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full mb-6 bg-white border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-600 hover:border-stone-400 transition-colors flex items-center justify-center gap-2"
      >
        🗺️ Show map ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
      </button>
    )
  }

  return <TaskMap tasks={tasks} />
}
