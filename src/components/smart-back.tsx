'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SmartBack({ fallback = '/dashboard', fallbackLabel = 'Back to dashboard' }: { fallback?: string; fallbackLabel?: string }) {
  const router = useRouter()
  const [label, setLabel] = useState(fallbackLabel)

  useEffect(() => {
    if (typeof document === 'undefined') return
    try {
      const ref = document.referrer
      if (!ref) return
      const url = new URL(ref)
      if (url.origin !== window.location.origin) return
      if (url.pathname === '/tasks') setLabel('Back to tasks')
      else if (url.pathname === '/dashboard') setLabel('Back to dashboard')
      else if (url.pathname.startsWith('/messages')) setLabel('Back to messages')
    } catch {}
  }, [])

  const handleBack = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      e.preventDefault()
      router.back()
    }
  }

  return (
    <Link href={fallback} onClick={handleBack} className="text-sm text-stone-500 hover:text-stone-700">
      ← {label}
    </Link>
  )
}
