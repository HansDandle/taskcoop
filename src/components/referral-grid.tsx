'use client'

import { useState } from 'react'
import { REFERRAL_CATEGORIES } from '@/lib/referral-slots'

type Slot = {
  category: string
  slot_number: number
  code: string
  referred_user_id: string | null
}

export default function ReferralGrid({ slots, baseUrl, firstName }: { slots: Slot[]; baseUrl: string; firstName: string }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (code: string) => {
    const url = `${baseUrl}/signup?ref=${code}`
    await navigator.clipboard.writeText(`${firstName} is inviting you to join the launch of task.coop - ${url}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const byCategory = Object.fromEntries(
    REFERRAL_CATEGORIES.map(cat => [
      cat.id,
      [1, 2, 3, 4, 5].map(n => slots.find(s => s.category === cat.id && s.slot_number === n) ?? null),
    ])
  )

  const usedTotal = slots.filter(s => s.referred_user_id).length
  const categoriesWithAny = REFERRAL_CATEGORIES.filter(cat =>
    slots.some(s => s.category === cat.id && s.referred_user_id)
  ).length
  const allFull = REFERRAL_CATEGORIES.every(cat =>
    slots.filter(s => s.category === cat.id && s.referred_user_id).length >= 5
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{usedTotal} of 25 slots filled · {categoriesWithAny} of 5 categories started</span>
        {allFull && <span className="text-emerald-600 font-semibold">Full Roster complete! 🎉</span>}
      </div>

      <div className="space-y-3">
        {REFERRAL_CATEGORIES.map(cat => {
          const catSlots = byCategory[cat.id]
          const usedInCat = catSlots.filter(s => s?.referred_user_id).length
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-medium text-stone-600">{cat.label}</span>
                {usedInCat >= 5 && <span className="text-xs text-emerald-600 font-semibold ml-auto">Complete ✓</span>}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {catSlots.map((slot, i) => {
                  if (!slot) return <div key={i} className="h-9 rounded bg-stone-100" />
                  if (slot.referred_user_id) {
                    return (
                      <div key={slot.code} className="h-9 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 text-sm">
                        ✓
                      </div>
                    )
                  }
                  return (
                    <button
                      key={slot.code}
                      onClick={() => copy(slot.code)}
                      title="Copy invite link"
                      className="h-9 rounded bg-stone-50 border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50 flex items-center justify-center text-xs text-stone-400 hover:text-emerald-600 transition-colors"
                    >
                      {copied === slot.code ? '✓' : 'Copy'}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-stone-400">Click any open slot to copy a unique invite link. Each link can only be used once.</p>
    </div>
  )
}
