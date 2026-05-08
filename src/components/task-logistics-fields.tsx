'use client'

import { useState } from 'react'

const DURATION_OPTIONS = [
  { value: 'under_1hr', label: 'Less than 1 hour' },
  { value: '1_2hrs', label: '1–2 hours' },
  { value: 'half_day', label: 'Half day (3–4 hrs)' },
  { value: 'full_day', label: 'Full day' },
  { value: 'multi_day', label: 'Multiple days' },
  { value: 'not_sure', label: 'Not sure' },
]

const TOOLS_OPTIONS = [
  { value: 'just_show_up', label: 'Just show up', sub: 'I have all tools and materials on-site' },
  { value: 'i_have_tools', label: 'Bring your skills', sub: 'I have tools but need the labor' },
  { value: 'some_materials', label: 'Some materials needed', sub: 'I have some things, let\'s discuss the rest' },
  { value: 'bring_everything', label: 'Bring tools & materials', sub: 'Worker should come fully equipped' },
]

const ACCESS_OPTIONS = [
  { value: 'someone_home', label: 'Someone will be home' },
  { value: 'provide_code', label: 'I\'ll provide a door/gate code' },
  { value: 'unattended_ok', label: 'Unattended access is fine' },
  { value: 'tbd', label: 'TBD — we\'ll coordinate' },
]

const PHYSICAL_OPTIONS = [
  { value: 'heavy_lifting', label: 'Heavy lifting (50+ lbs)' },
  { value: 'ladder_access', label: 'Ladder or roof access' },
  { value: 'tight_spaces', label: 'Tight or confined spaces' },
]

interface Props {
  defaults?: {
    duration_estimate?: string | null
    tools_situation?: string | null
    access_situation?: string | null
    physical_requirements?: string[]
  }
}

export default function TaskLogisticsFields({ defaults }: Props) {
  const [physical, setPhysical] = useState<string[]>(defaults?.physical_requirements ?? [])

  function togglePhysical(value: string) {
    setPhysical(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="border-t border-stone-100 pt-6">
        <h3 className="text-sm font-semibold text-stone-700 mb-4">Job logistics</h3>
        <p className="text-xs text-stone-400 mb-5 leading-relaxed">
          These details help workers prepare properly and send you accurate offers — no back-and-forth required.
        </p>

        {/* Duration */}
        <div className="space-y-2 mb-5">
          <label className="block text-sm font-medium text-stone-700">
            How long do you expect this to take?
          </label>
          <select
            name="duration_estimate"
            defaultValue={defaults?.duration_estimate ?? ''}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select an estimate</option>
            {DURATION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Tools & materials */}
        <div className="space-y-2 mb-5">
          <label className="block text-sm font-medium text-stone-700">
            Tools & materials <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {TOOLS_OPTIONS.map(o => (
              <label key={o.value} className="flex items-start gap-3 border border-stone-200 rounded-lg px-4 py-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
                <input type="radio" name="tools_situation" value={o.value} required
                  defaultChecked={defaults?.tools_situation === o.value}
                  className="mt-0.5 accent-emerald-600 shrink-0" />
                <span>
                  <span className="block text-sm font-medium text-stone-800">{o.label}</span>
                  <span className="block text-xs text-stone-400 mt-0.5">{o.sub}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Access */}
        <div className="space-y-2 mb-5">
          <label className="block text-sm font-medium text-stone-700">Property access</label>
          <div className="grid grid-cols-2 gap-2">
            {ACCESS_OPTIONS.map(o => (
              <label key={o.value} className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2.5 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
                <input type="radio" name="access_situation" value={o.value}
                  defaultChecked={defaults?.access_situation === o.value}
                  className="accent-emerald-600 shrink-0" />
                <span className="text-sm text-stone-700">{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Physical requirements */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">Physical requirements <span className="text-xs font-normal text-stone-400">(optional)</span></label>
          <input type="hidden" name="physical_requirements" value={JSON.stringify(physical)} />
          <div className="flex flex-wrap gap-2">
            {PHYSICAL_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => togglePhysical(o.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  physical.includes(o.value)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                }`}
              >
                {physical.includes(o.value) ? '✓ ' : ''}{o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
