'use client'

import { useState } from 'react'

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded px-2 py-1 transition-colors shrink-0"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
