'use client'

import { useActionState, useState } from 'react'
import { updateTask } from './actions'
import MultiImageUpload from '@/components/multi-image-upload'
import TaskLogisticsFields from '@/components/task-logistics-fields'
import AddressPicker from '@/components/address-picker'

type Category = { id: string; name: string; slug: string }
type Address = { id: string; label: string; street: string; city: string; state: string; zip: string }

export default function EditTaskForm({
  task,
  existingImages,
  categories,
  userId,
  savedAddresses,
}: {
  task: any
  existingImages: string[]
  categories: Category[]
  userId: string
  savedAddresses: Address[]
}) {
  const [state, action, pending] = useActionState(updateTask, { error: '' })
  const [imageUrls, setImageUrls] = useState<string[]>(existingImages)

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="task_id" value={task.id} />
      <input type="hidden" name="image_urls" value={JSON.stringify(imageUrls)} />

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input
          name="title"
          required
          defaultValue={task.title}
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Category <span className="text-red-500">*</span></label>
        <select
          name="category_id"
          required
          defaultValue={task.category_id}
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
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
          defaultValue={task.description}
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
        <p className="text-xs text-stone-400 mb-3">Up to 6 photos. Remove or add more to help workers understand the job.</p>
        <MultiImageUpload
          bucket="task-images"
          folder={userId}
          existingUrls={existingImages}
          onChange={setImageUrls}
          max={6}
          label="Add photo"
        />
      </div>

      <TaskLogisticsFields defaults={{
        duration_estimate: task.duration_estimate,
        tools_situation: task.tools_situation,
        access_situation: task.access_situation,
        physical_requirements: task.physical_requirements ?? [],
      }} />

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">Job location <span className="text-red-500">*</span></label>
        <AddressPicker
          saved={savedAddresses}
          defaultAddressId={task.address_id}
          defaultZip={task.zip_code}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Budget ($)</label>
        <input
          name="budget"
          type="number"
          min="5"
          step="5"
          defaultValue={task.budget ?? ''}
          placeholder="Leave blank to receive offers"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Preferred date / time</label>
        <input
          name="preferred_time"
          type="datetime-local"
          defaultValue={task.preferred_time ? new Date(task.preferred_time).toISOString().slice(0, 16) : ''}
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
