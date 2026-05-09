'use client'

import { useTransition } from 'react'
import { adminCancelTask, adminDeleteTask } from './actions'

export default function AdminTaskActions({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  const run = (action: (fd: FormData) => Promise<any>) => {
    const fd = new FormData()
    fd.set('task_id', taskId)
    startTransition(async () => { await action(fd) })
  }

  const confirmDelete = () => {
    if (!confirm('Delete this task permanently?')) return
    run(adminDeleteTask)
  }

  return (
    <div className="flex gap-3 items-center">
      {status !== 'cancelled' && status !== 'completed' && (
        <button onClick={() => run(adminCancelTask)} disabled={isPending}
          className="text-xs text-amber-600 hover:underline disabled:opacity-60">
          Force cancel
        </button>
      )}
      <button onClick={confirmDelete} disabled={isPending}
        className="text-xs text-red-500 hover:underline disabled:opacity-60">
        Delete
      </button>
    </div>
  )
}
