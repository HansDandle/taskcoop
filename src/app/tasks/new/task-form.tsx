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
        <label className="block text-sm font-medium text-stone-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input
          name="title"
          required
          placeholder="e.g. Fix leaky faucet in kitchen"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Category <span className="text-red-500">*</span></label>
        <select
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Description <span className="text-red-500">*</span></label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Describe what needs to be done and what a successful result looks like. The more detail the better; workers use this to send accurate offers."
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
          Good to include: the end result you're after, any relevant measurements or constraints, and how flexible your timing is.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
        <p className="text-xs text-stone-400 mb-3">Add up to 6 photos to help workers understand the job.</p>
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

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Budget ($)</label>
        <input
          name="budget"
          type="number"
          min="5"
          step="5"
          placeholder="Leave blank to receive offers"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Preferred date / time</label>
        <input
          name="preferred_time"
          type="datetime-local"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <TaskExpectations />

      <div className="border border-stone-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="require_id_verified" defaultChecked className="mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-stone-700">Require ID-verified members only</div>
            <div className="text-xs text-stone-400 mt-0.5">Only members who have had their government ID verified can submit offers. Recommended.</div>
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

      <p className="text-xs text-stone-400 text-center">Free to post. You only pay when you accept an offer.</p>
    </form>
  )
}
