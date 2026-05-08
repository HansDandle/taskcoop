'use client'

import { useActionState, useState } from 'react'
import { addAddress, deleteAddress } from './address-actions'

type Address = { id: string; label: string; street: string; city: string; state: string; zip: string }

const initial = { error: '' }

export default function AddressManager({ addresses }: { addresses: Address[] }) {
  const [state, action, pending] = useActionState(addAddress, initial)
  const [showForm, setShowForm] = useState(addresses.length === 0)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    await deleteAddress(id)
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-700">Saved addresses</h3>
          <p className="text-xs text-stone-400 mt-0.5">Used when posting tasks. Workers only see the ZIP until you accept their offer.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="text-xs text-emerald-600 hover:underline font-medium">
            + Add address
          </button>
        )}
      </div>

      {addresses.length > 0 && (
        <div className="space-y-2">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-start justify-between border border-stone-200 rounded-lg px-4 py-3">
              <div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">{addr.label}</div>
                <div className="text-sm text-stone-800">{addr.street}</div>
                <div className="text-sm text-stone-500">{addr.city}, {addr.state} {addr.zip}</div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                disabled={deleting === addr.id}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors ml-4 shrink-0 mt-0.5"
              >
                {deleting === addr.id ? '…' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form action={action} className="border border-stone-200 rounded-lg p-4 space-y-3 bg-stone-50">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-medium text-stone-600 mb-1">Label</label>
              <input name="label" placeholder="Home" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-stone-600 mb-1">Street address <span className="text-red-500">*</span></label>
              <input name="street" required placeholder="123 Main St, Apt 4B" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-medium text-stone-600 mb-1">City</label>
              <input name="city" defaultValue="Austin" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-stone-600 mb-1">State</label>
              <input name="state" defaultValue="TX" maxLength={2} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-stone-600 mb-1">ZIP <span className="text-red-500">*</span></label>
              <input name="zip" required pattern="[0-9]{5}" placeholder="78701" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
          </div>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60">
              {pending ? 'Saving…' : 'Save address'}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-stone-500 px-4 py-2 hover:text-stone-700">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
