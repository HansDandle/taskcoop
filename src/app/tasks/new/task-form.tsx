'use client'

import { useActionState, useState } from 'react'
import { createTask } from './actions'
import MultiImageUpload from '@/components/multi-image-upload'
import TaskLogisticsFields from '@/components/task-logistics-fields'
import AddressPicker from '@/components/address-picker'
import TaskExpectations from '@/components/task-expectations'

type Category = { id: string; name: string; slug: string }
type Address = { id: string; label: string; street: string; city: string; state: string; zip: string }

const initialState = { error: '' }

export default function TaskForm({
  categories,
  userId,
  savedAddresses,
}: {
  categories: Category[]
  userId: string
  savedAddresses: Address[]
}) {
  const [state, action, pending] = useActionState(createTask, initialState)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="image_urls" value={JSON.stringify(imageUrls)} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Fix leaky faucet in kitchen"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-stone-700 mb-1">Category <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
        <select
          id="category_id"
          name="category_id"
          required
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">Description <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="Describe what needs to be done and what a successful result looks like. The more detail the better; workers use this to send accurate offers."
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
          Good to include: the end result you&apos;re after, any relevant measurements or constraints, and how flexible your timing is.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
        <p className="text-sm text-stone-600 mb-3">Add up to 6 photos to help workers understand the job.</p>
        <MultiImageUpload
          bucket="task-images"
          folder={userId}
          onChange={setImageUrls}
          max={6}
          label="Add photo"
        />
      </div>

      <TaskLogisticsFields />

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">Job location <span className="text-red-500">*</span></label>
        <AddressPicker saved={savedAddresses} />
      </div>

      <details className="border border-stone-200 rounded-lg group">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-stone-700 select-none flex items-center justify-between">
          <span>Budget & timing (optional)</span>
          <span className="text-stone-400 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
        </summary>
        <div className="px-4 pb-4 space-y-4 border-t border-stone-200 pt-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-stone-700 mb-1">Budget ($)</label>
            <input
              id="budget"
              name="budget"
              type="number"
              min="5"
              step="5"
              placeholder="Leave blank to receive offers"
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="preferred_time" className="block text-sm font-medium text-stone-700 mb-1">Preferred date / time</label>
            <input
              id="preferred_time"
              name="preferred_time"
              type="datetime-local"
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </details>

      <TaskExpectations />

      <div className="border border-stone-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input id="require_id_verified" type="checkbox" name="require_id_verified" defaultChecked className="mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-stone-700">Require ID-verified members only</div>
            <div className="text-sm text-stone-600 mt-0.5">Only members who have had their government ID verified can submit offers. Recommended.</div>
          </div>
        </label>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Posting…' : 'Post Task'}
      </button>

      <p className="text-sm text-stone-500 text-center">Free to post. You only pay when you accept an offer.</p>
    </form>
  )
}
