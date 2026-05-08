'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Props {
  bucket: string
  folder: string
  existingUrls?: string[]
  onChange: (urls: string[]) => void
  max?: number
  label?: string
}

export default function MultiImageUpload({ bucket, folder, existingUrls = [], onChange, max = 8, label = 'Add photos' }: Props) {
  const [urls, setUrls] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const toUpload = Array.from(files).slice(0, max - urls.length)
    if (!toUpload.length) return
    setError(null)
    setUploading(true)

    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 8 * 1024 * 1024) { setError('Some files exceeded 8 MB and were skipped.'); continue }
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (uploadError) continue
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    const updated = [...urls, ...newUrls]
    setUrls(updated)
    onChange(updated)
    setUploading(false)
  }

  function remove(url: string) {
    const updated = urls.filter(u => u !== url)
    setUrls(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {urls.map((url) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden group border border-stone-200">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        {urls.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors flex flex-col items-center justify-center gap-1 text-stone-400 disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files) }}
      />
    </div>
  )
}
