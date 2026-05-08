'use client'

import { useTransition } from 'react'
import { changeUserRole } from './actions'

export default function AdminUserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition()

  const handle = (role: string) => {
    const fd = new FormData()
    fd.set('user_id', userId)
    fd.set('role', role)
    startTransition(async () => { await changeUserRole(fd) })
  }

  return (
    <div className="flex gap-2">
      {currentRole !== 'worker' && (
        <button onClick={() => handle('worker')} disabled={isPending} className="text-xs text-blue-600 hover:underline disabled:opacity-60">
          Make worker
        </button>
      )}
      {currentRole !== 'customer' && (
        <button onClick={() => handle('customer')} disabled={isPending} className="text-xs text-stone-600 hover:underline disabled:opacity-60">
          Make customer
        </button>
      )}
    </div>
  )
}
