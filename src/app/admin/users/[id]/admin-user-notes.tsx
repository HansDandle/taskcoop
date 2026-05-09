'use client'

import { useState, useTransition } from 'react'
import { saveAdminNotes } from '../actions'

export default function AdminUserNotes({ userId, initialNotes }: { userId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('user_id', userId)
      fd.set('notes', notes)
      await saveAdminNotes(fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5">
      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Internal notes</div>
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        rows={4}
        placeholder="Notes visible only to admins…"
        className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-stone-400">Never shown to the user.</span>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors disabled:opacity-60"
        >
          {saved ? 'Saved ✓' : isPending ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}
