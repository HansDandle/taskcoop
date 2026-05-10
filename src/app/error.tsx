'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Try again, or head back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="text-sm text-stone-500 hover:text-stone-700 border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors"
          >
            Try again
          </button>
          <Link href="/dashboard" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors font-medium">
            Go to dashboard
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-stone-300 mt-6 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
