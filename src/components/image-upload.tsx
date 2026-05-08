'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'

interface CropArea { x: number; y: number; width: number; height: number }

interface Props {
  bucket: string
  folder: string
  existingUrl?: string | null
  onUpload: (url: string) => void
  shape?: 'circle' | 'square'
  label?: string
}

async function getCroppedBlob(imageSrc: string, cropPx: CropArea): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new window.Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = cropPx.width
  canvas.height = cropPx.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height)
  return new Promise((res, rej) => canvas.toBlob((b) => b ? res(b) : rej(), 'image/jpeg', 0.92))
}

export default function ImageUpload({ bucket, folder, existingUrl, onUpload, shape = 'square', label = 'Upload image' }: Props) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null)
  const [srcForCrop, setSrcForCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPx, setCroppedAreaPx] = useState<CropArea | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: unknown, px: CropArea) => setCroppedAreaPx(px), [])

  function handleFileChange(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 20 * 1024 * 1024) { setError('Image must be under 20 MB.'); return }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setSrcForCrop(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm() {
    if (!srcForCrop || !croppedAreaPx) return
    setUploading(true)
    setError(null)
    try {
      const blob = await getCroppedBlob(srcForCrop, croppedAreaPx)
      const path = `${folder}/${Date.now()}.jpg`
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      setPreview(data.publicUrl)
      onUpload(data.publicUrl)
      setSrcForCrop(null)
    } catch {
      setError('Upload failed. Try again.')
    }
    setUploading(false)
  }

  const shapeClass = shape === 'circle' ? 'rounded-full aspect-square' : 'rounded-lg aspect-video'
  const cropShape = shape === 'circle' ? 'round' : 'rect'

  return (
    <>
      <div className="space-y-2">
        <div
          className={`relative overflow-hidden border-2 border-dashed border-stone-300 bg-stone-50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer ${shapeClass}`}
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f) }}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-stone-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-xs font-medium">{label}</span>
              <span className="text-xs">or drag & drop</span>
            </div>
          )}
        </div>
        {preview && (
          <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-stone-500 hover:text-emerald-600">
            Change photo
          </button>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }} />
      </div>

      {/* Crop modal */}
      {srcForCrop && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="relative flex-1">
            <Cropper
              image={srcForCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="bg-black px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs w-12 shrink-0">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setSrcForCrop(null); setZoom(1); setCrop({ x: 0, y: 0 }) }}
                className="px-5 py-2 rounded-md text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                disabled={uploading}
                className="px-6 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                {uploading ? 'Saving…' : 'Use this photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
