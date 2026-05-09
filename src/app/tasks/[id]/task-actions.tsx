'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateTaskStatus, cancelTask, releaseFunds } from './actions'

export default function TaskActions({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handle = (action: (fd: FormData) => Promise<{ error?: string } | void>) => {
    const fd = new FormData()
    fd.set('task_id', taskId)
    startTransition(async () => { await action(fd) })
  }

  const handleComplete = () => {
    startTransition(async () => {
      await releaseFunds(taskId)
      router.push(`/tasks/${taskId}/review`)
    })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
      <div className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">Manage task</div>
      {status === 'assigned' && (
        <button
          onClick={() => handle(updateTaskStatus.bind(null, 'in_progress'))}
          disabled={isPending}
          className="w-full text-sm bg-amber-100 text-amber-800 py-2 rounded-md hover:bg-amber-200 transition-colors disabled:opacity-60"
        >
          Mark In Progress
        </button>
      )}
      {(status === 'assigned' || status === 'in_progress') && (
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="w-full text-sm bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          Mark Complete & Rate Member
        </button>
      )}
      {(status === 'open' || status === 'assigned') && (
        <button
          onClick={() => handle(cancelTask)}
          disabled={isPending}
          className="w-full text-sm text-stone-500 py-2 hover:text-red-600 transition-colors disabled:opacity-60"
        >
          Cancel task
        </button>
      )}
    </div>
  )
}
