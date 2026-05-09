'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  bucket: string
  folder: string
  existingUrl?: string | null
  onUpload: (url: string) => void
  accept?: string
  label?: string
}

export default function FileUpload({ bucket, folder, existingUrl, onUpload, accept = 'image/*,.pdf', label = 'Upload file' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState(!!existingUrl)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${folder}/${Date.now()}.${ext}`
    const supabase = createClient()

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Upload failed. Please try again.')
      setUploading(false)
      return
    }

    // Store the storage path (not a public URL — bucket is private)
    onUpload(path)
    setUploaded(true)
    setUploading(false)
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="sr-only" />
      {uploaded && !uploading ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-emerald-700 font-medium">✓ File uploaded</span>
          <button type="button" onClick={() => { setUploaded(false); inputRef.current?.click() }}
            className="text-xs text-stone-500 hover:underline">Replace</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-stone-300 rounded-md px-4 py-2 text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-colors disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : label}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
