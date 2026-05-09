'use client'

import { useTransition } from 'react'
import { changeUserRole, suspendUser, deleteUser, setIdVerification, getIdDocumentPath } from './actions'

export default function AdminUserActions({
  userId,
  currentRole,
  suspended,
  idVerificationStatus,
}: {
  userId: string
  currentRole: string
  suspended: boolean
  idVerificationStatus: string | null
}) {
  const [isPending, startTransition] = useTransition()

  const run = (action: (fd: FormData) => Promise<any>, fields: Record<string, string>) => {
    const fd = new FormData()
    fd.set('user_id', userId)
    for (const [k, v] of Object.entries(fields)) fd.set(k, v)
    startTransition(async () => { await action(fd) })
  }

  const confirmDelete = () => {
    if (!confirm('Permanently delete this user and all their data? This cannot be undone.')) return
    run(deleteUser, {})
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
      {currentRole !== 'worker' && (
        <button onClick={() => run(changeUserRole, { role: 'worker' })} disabled={isPending}
          className="text-xs text-blue-600 hover:underline disabled:opacity-60">Make member</button>
      )}
      {currentRole !== 'customer' && (
        <button onClick={() => run(changeUserRole, { role: 'customer' })} disabled={isPending}
          className="text-xs text-stone-600 hover:underline disabled:opacity-60">Make customer</button>
      )}
      {currentRole !== 'admin' && (
        <button onClick={() => run(changeUserRole, { role: 'admin' })} disabled={isPending}
          className="text-xs text-purple-600 hover:underline disabled:opacity-60">Make admin</button>
      )}

      <span className="text-stone-200">|</span>

      <button
        onClick={() => run(suspendUser, { suspended: suspended ? 'false' : 'true' })}
        disabled={isPending}
        className={`text-xs hover:underline disabled:opacity-60 ${suspended ? 'text-emerald-600' : 'text-amber-600'}`}
      >
        {suspended ? 'Unsuspend' : 'Suspend'}
      </button>

      {idVerificationStatus === 'pending' && (
        <>
          <button
            onClick={async () => {
              const path = await getIdDocumentPath(userId)
              if (path) window.open(`/api/admin/id-document?path=${encodeURIComponent(path)}`, '_blank')
            }}
            disabled={isPending}
            className="text-xs text-stone-500 hover:underline disabled:opacity-60"
          >View ID</button>
          <button onClick={() => run(setIdVerification, { status: 'approved' })} disabled={isPending}
            className="text-xs text-emerald-600 hover:underline disabled:opacity-60">Approve ID</button>
          <button onClick={() => run(setIdVerification, { status: 'rejected' })} disabled={isPending}
            className="text-xs text-red-500 hover:underline disabled:opacity-60">Reject ID</button>
        </>
      )}

      <span className="text-stone-200">|</span>

      <button onClick={confirmDelete} disabled={isPending}
        className="text-xs text-red-500 hover:underline disabled:opacity-60">Delete</button>
    </div>
  )
}
