'use client'

import dynamic from 'next/dynamic'

const TaskMap = dynamic(() => import('./task-map'), {
  ssr: false,
  loading: () => <div className="w-full h-72 rounded-lg bg-stone-100 animate-pulse mb-6" />,
})

export default function TaskMapLoader({ tasks }: { tasks: Parameters<typeof TaskMap>[0]['tasks'] }) {
  return <TaskMap tasks={tasks} />
}
