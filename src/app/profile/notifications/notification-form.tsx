'use client'

import { useState, useTransition } from 'react'
import { NOTIFICATION_TYPES } from '@/lib/notification-prefs'
import { savePreferences } from './actions'

export default function NotificationForm({ initial }: { initial: Record<string, boolean> }) {
  const [prefs, setPrefs] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const toggle = (key: string) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
    setSaved(false)
  }

  const save = () => {
    setSaved(false)
    startTransition(async () => {
      await savePreferences(prefs)
      setSaved(true)
    })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-stone-600">Notification</th>
              <th className="text-center px-5 py-3 font-medium text-stone-600 w-24">Email</th>
              <th className="text-center px-5 py-3 font-medium text-stone-600 w-24">Push</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {NOTIFICATION_TYPES.map((t) => (
              <tr key={t.value}>
                <td className="px-5 py-3">
                  <div className="font-medium text-stone-900">{t.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{t.description}</div>
                </td>
                <td className="px-5 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={prefs[`email_${t.value}`]}
                    onChange={() => toggle(`email_${t.value}`)}
                    className="w-5 h-5 cursor-pointer accent-emerald-600"
                  />
                </td>
                <td className="px-5 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={prefs[`push_${t.value}`]}
                    onChange={() => toggle(`push_${t.value}`)}
                    className="w-5 h-5 cursor-pointer accent-emerald-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
        <span className="text-xs text-stone-500">
          {saved && !isPending ? '✓ Preferences saved' : 'Changes are saved when you click Save'}
        </span>
        <button
          onClick={save}
          disabled={isPending}
          className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
