'use client'

import { useState } from 'react'

const PREVIEW_LENGTH = 500

export default function TaskDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > PREVIEW_LENGTH
  const displayed = !isLong || expanded ? text : text.slice(0, PREVIEW_LENGTH).trimEnd() + '…'

  return (
    <div>
      <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{displayed}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="mt-2 text-sm text-emerald-600 hover:underline font-medium"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
