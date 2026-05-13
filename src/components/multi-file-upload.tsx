'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type LicenseEntry = { title: string; path: string; approved?: boolean }

interface Props {
  bucket: string
  folder: string
  existing?: LicenseEntry[]
  onChange: (entries: LicenseEntry[]) => void
  max?: number
  accept?: string
}

// Multi-file upload to a private bucket. Stores storage paths (not public URLs).
// Each entry has a title the worker can edit; titles are what render publicly
// once an admin approves the credential.
export default function MultiFileUpload({
  bucket,
  folder,
  existing = [],
  onChange,
  max = 6,
  accept = 'image/*,.pdf',
}: Props) {
  const [entries, setEntries] = useState<LicenseEntry[]>(existing)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    const toUpload = Array.from(files).slice(0, max - entries.length)
    if (!toUpload.length) return
    setError('')
    setUploading(true)
    const supabase = createClient()
    const added: LicenseEntry[] = []

    for (const file of toUpload) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Files must be 8 MB or smaller.')
        continue
      }
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
      if (uploadError) {
        setError('Upload failed. Please try again.')
        continue
      }
      const defaultTitle = file.name.replace(/\.[^.]+$/, '')
      added.push({ title: defaultTitle, path, approved: false })
    }

    const next = [...entries, ...added]
    setEntries(next)
    onChange(next)
    setUploading(false)
  }

  const updateTitle = (idx: number, title: string) => {
    const next = entries.map((e, i) => (i === idx ? { ...e, title } : e))
    setEntries(next)
    onChange(next)
  }

  const remove = (idx: number) => {
    const next = entries.filter((_, i) => i !== idx)
    setEntries(next)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept={accept} multiple className="sr-only"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files) }} />

      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li key={`${entry.path}-${i}`} className="flex items-center gap-2 border border-stone-200 rounded-md px-3 py-2 bg-stone-50">
              <input
                value={entry.title}
                onChange={(e) => updateTitle(i, e.target.value)}
                placeholder="e.g. Notary Commission"
                className="flex-1 bg-white border border-stone-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {entry.approved && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">✓ Verified</span>
              )}
              <button type="button" onClick={() => remove(i)}
                className="text-xs text-stone-500 hover:text-red-600 shrink-0">Remove</button>
            </li>
          ))}
        </ul>
      )}

      {entries.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-stone-300 rounded-md px-4 py-2 text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-colors disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : '+ Add license or certification'}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-sm text-stone-600">
        Add a clear photo or PDF of each license, permit, or certification. Title each one so reviewers know what they&apos;re looking at.
      </p>
    </div>
  )
}
