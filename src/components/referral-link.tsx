'use client'

import { useState } from 'react'

export default function ReferralLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded px-3 py-2 text-stone-600 font-mono truncate"
      />
      <button
        onClick={copy}
        className="shrink-0 text-xs bg-stone-900 text-white px-3 py-2 rounded hover:bg-stone-700 transition-colors font-medium"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
