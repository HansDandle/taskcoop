'use client'

import dynamic from 'next/dynamic'

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
  return <TaskMap tasks={tasks} />
}
