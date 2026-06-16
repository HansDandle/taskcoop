// Shared client-side file validation for the upload components.

// iPhone photos are often HEIC/HEIF, which browsers can't render in an <img>.
// Uploading still works; callers just skip the preview for these.
export const isHeic = (file: File) =>
  /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)

export const isImage = (file: File) => file.type.startsWith('image/') && !isHeic(file)

export function accepted(file: File, accept: string) {
  const tokens = accept.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some(t => {
    if (t.endsWith('/*')) return type.startsWith(t.slice(0, -1)) // e.g. image/*
    if (t.startsWith('.')) return name.endsWith(t)               // e.g. .pdf
    return type === t
  })
}

// Returns a human-readable error string, or null if the file is acceptable.
export function validateFile(file: File, accept: string, maxSizeMB: number): string | null {
  if (!accepted(file, accept)) return 'That file type is not supported. Please use a photo or PDF.'
  if (file.size > maxSizeMB * 1024 * 1024) return `That file is too large. Please use one under ${maxSizeMB} MB.`
  return null
}
