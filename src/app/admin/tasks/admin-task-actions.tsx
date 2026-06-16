'use client'

import { useState, useTransition } from 'react'
import { adminCancelTask, adminDeleteTask } from './actions'

export default function AdminTaskActions({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (action: (fd: FormData) => Promise<{ error: string | null }>) => {
    const fd = new FormData()
    fd.set('task_id', taskId)
    setError(null)
    startTransition(async () => {
      const res = await action(fd)
      if (res?.error) setError(res.error)
    })
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
      {error && <span className="text-xs text-red-600" title={error}>Failed</span>}
    </div>
  )
}
