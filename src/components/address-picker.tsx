'use client'

import { useState } from 'react'

type Address = { id: string; label: string; street: string; city: string; state: string; zip: string }

interface Props {
  saved: Address[]
  defaultAddressId?: string | null
  defaultZip?: string
  defaultStreet?: string
  defaultCity?: string
  defaultState?: string
}

export default function AddressPicker({ saved, defaultAddressId, defaultZip, defaultStreet, defaultCity, defaultState }: Props) {
  const [selected, setSelected] = useState<string>(
    defaultAddressId ?? (saved.length > 0 ? saved[0].id : 'new')
  )
  const [saveNew, setSaveNew] = useState(false)

  const selectedAddr = saved.find(a => a.id === selected)

  // Sync zip_code field when picking a saved address
  function handleSelect(id: string) {
    setSelected(id)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
        <strong>Privacy note:</strong> Workers only see your ZIP code until you accept their offer.
        Once you accept, your full address is shared so they can show up.
      </div>

      {saved.length > 0 && (
        <div className="space-y-2">
          {saved.map(addr => (
            <label
              key={addr.id}
              className="flex items-start gap-3 border border-stone-200 rounded-lg px-4 py-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors"
            >
              <input
                type="radio"
                name="_address_selection"
                value={addr.id}
                checked={selected === addr.id}
                onChange={() => handleSelect(addr.id)}
                className="mt-0.5 accent-emerald-600 shrink-0"
              />
              <span>
                <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">{addr.label}</span>
                <span className="block text-sm text-stone-800">{addr.street}</span>
                <span className="block text-xs text-stone-500">{addr.city}, {addr.state} {addr.zip}</span>
              </span>
              {/* Hidden fields populated when this address is selected */}
              {selected === addr.id && (
                <>
                  <input type="hidden" name="address_street" value={addr.street} />
                  <input type="hidden" name="address_city" value={addr.city} />
                  <input type="hidden" name="address_state" value={addr.state} />
                  <input type="hidden" name="zip_code" value={addr.zip} />
                </>
              )}
            </label>
          ))}
          <label className="flex items-center gap-3 border border-stone-200 rounded-lg px-4 py-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
            <input
              type="radio"
              name="_address_selection"
              value="new"
              checked={selected === 'new'}
              onChange={() => handleSelect('new')}
              className="accent-emerald-600 shrink-0"
            />
            <span className="text-sm text-stone-700">Use a different address</span>
          </label>
        </div>
      )}

      {(selected === 'new' || saved.length === 0) && (
        <div className="space-y-3 border border-stone-200 rounded-lg p-4 bg-stone-50">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Street address <span className="text-red-500">*</span></label>
            <input name="address_street" required placeholder="123 Main St" defaultValue={defaultStreet ?? ''} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-stone-600 mb-1">City</label>
              <input name="address_city" defaultValue={defaultCity ?? 'Austin'} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">State</label>
              <input name="address_state" defaultValue={defaultState ?? 'TX'} maxLength={2} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">ZIP <span className="text-red-500">*</span></label>
              <input name="zip_code" required pattern="[0-9]{5}" defaultValue={defaultZip ?? ''} placeholder="78701" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={saveNew} onChange={e => setSaveNew(e.target.checked)} name="save_address" className="accent-emerald-600" />
            <span className="text-xs text-stone-500">Save this address to my profile for next time</span>
          </label>
        </div>
      )}
    </div>
  )
}
