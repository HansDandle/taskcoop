'use client'

import { useState, useTransition } from 'react'
import MultiImageUpload from '@/components/multi-image-upload'
import { workerMarkDone, workerUpdateStatus } from './actions'

export default function WorkerActions({
  taskId,
  status,
  workerMarkedDone,
  existingPhotos,
}: {
  taskId: string
  status: string
  workerMarkedDone: boolean
  existingPhotos: string[]
}) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(workerMarkedDone)

  const run = (action: (fd: FormData) => Promise<any>, extra?: Record<string, string>) => {
    const fd = new FormData()
    fd.set('task_id', taskId)
    if (extra) Object.entries(extra).forEach(([k, v]) => fd.set(k, v))
    startTransition(async () => { await action(fd) })
  }

  const handleMarkDone = () => {
    if (!confirm('Mark this job as complete? The customer will be notified to review and release payment.')) return
    const fd = new FormData()
    fd.set('task_id', taskId)
    fd.set('completion_photos', JSON.stringify(photos))
    startTransition(async () => {
      await workerMarkDone(fd)
      setDone(true)
    })
  }

  if (status === 'completed' || status === 'cancelled') return null

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-4">
      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Your job controls</div>

      {done ? (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          ✓ You've marked this job complete. Waiting for the customer to release payment.
        </div>
      ) : (
        <>
          {status === 'assigned' && (
            <button
              onClick={() => run(workerUpdateStatus, { status: 'in_progress' })}
              disabled={isPending}
              className="w-full text-sm bg-amber-100 text-amber-800 py-2 rounded-md hover:bg-amber-200 transition-colors disabled:opacity-60"
            >
              Mark as started
            </button>
          )}

          <div>
            <div className="text-xs font-medium text-stone-600 mb-2">Completion photos (optional but recommended)</div>
            <MultiImageUpload
              bucket="task-images"
              folder={`completion/${taskId}`}
              existingUrls={photos}
              onChange={setPhotos}
              max={6}
              label="Add proof photos"
            />
          </div>

          <button
            onClick={handleMarkDone}
            disabled={isPending}
            className="w-full text-sm bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            Mark job complete →
          </button>
          <p className="text-xs text-stone-400">The customer will be notified and asked to release payment.</p>
        </>
      )}
    </div>
  )
}
