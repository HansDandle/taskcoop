'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isImage, validateFile } from '@/lib/upload-validation'

interface Props {
  bucket: string
  folder: string
  existingUrl?: string | null
  onUpload: (url: string) => void
  accept?: string
  label?: string
  maxSizeMB?: number
}

export default function FileUpload({
  bucket,
  folder,
  existingUrl,
  onUpload,
  accept = 'image/*,.pdf',
  label = 'Upload file',
  maxSizeMB = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState(!!existingUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  // Revoke object URLs when they change or the component unmounts.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    const invalid = validateFile(file, accept, maxSizeMB)
    if (invalid) {
      setError(invalid)
      e.target.value = ''
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${folder}/${Date.now()}.${ext}`
    const supabase = createClient()

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Upload failed. Please check your connection and try again.')
      setUploading(false)
      return
    }

    // Local preview from the File itself — no signed URL needed for a private bucket.
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(isImage(file) ? URL.createObjectURL(file) : null)
    setFileName(file.name)

    // Store the storage path (not a public URL — bucket is private)
    onUpload(path)
    setUploaded(true)
    setUploading(false)
  }

  const pickFile = () => inputRef.current?.click()

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="sr-only" />
      {uploaded && !uploading ? (
        <div className="flex items-center gap-3">
          {previewUrl ? (
            <img src={previewUrl} alt="Uploaded preview"
              className="h-16 w-16 rounded-md object-cover border border-stone-200" />
          ) : (
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-2xl" aria-hidden="true">📄</span>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-emerald-700 font-medium">✓ Uploaded</span>
            {fileName && <span className="text-xs text-stone-500 truncate max-w-[12rem]">{fileName}</span>}
            <button type="button" onClick={() => { setUploaded(false); pickFile() }}
              className="text-xs text-stone-500 hover:underline text-left">Replace</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
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
