'use client'

import { useTransition } from 'react'
import { setLicenseApproval } from '../actions'

type License = { title: string; path: string; approved?: boolean }

export default function AdminLicenseReview({
  userId,
  licenses,
}: {
  userId: string
  licenses: License[]
}) {
  const [isPending, startTransition] = useTransition()

  if (!licenses?.length) return null

  const toggle = (path: string, approved: boolean) => {
    const fd = new FormData()
    fd.set('user_id', userId)
    fd.set('path', path)
    fd.set('approved', approved ? 'true' : 'false')
    startTransition(async () => { await setLicenseApproval(fd) })
  }

  const view = (path: string) =>
    window.open(`/api/admin/id-document?path=${encodeURIComponent(path)}`, '_blank')

  return (
    <div className="bg-white border border-stone-200 rounded-lg">
      <div className="px-5 py-4 border-b border-stone-200">
        <h2 className="font-semibold text-stone-900">Professional licenses ({licenses.length})</h2>
        <p className="text-sm text-stone-500 mt-0.5">Approved titles appear on the member&apos;s public profile.</p>
      </div>
      <ul className="divide-y divide-stone-100">
        {licenses.map((l) => (
          <li key={l.path} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-stone-900 truncate">{l.title}</div>
              <div className="text-xs text-stone-500 font-mono truncate">{l.path}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {l.approved && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Approved</span>}
              <button onClick={() => view(l.path)} className="text-xs text-stone-500 hover:underline">View</button>
              {l.approved ? (
                <button disabled={isPending} onClick={() => toggle(l.path, false)}
                  className="text-xs text-red-500 hover:underline disabled:opacity-60">Unapprove</button>
              ) : (
                <button disabled={isPending} onClick={() => toggle(l.path, true)}
                  className="text-xs text-emerald-600 hover:underline disabled:opacity-60">Approve</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
