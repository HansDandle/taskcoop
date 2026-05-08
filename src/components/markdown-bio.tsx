'use client'

import ReactMarkdown from 'react-markdown'

export default function MarkdownBio({ content, className }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-sm prose-stone max-w-none ${className ?? ''}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
