import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-stone-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Page not found</h1>
        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-700 border border-stone-200 px-4 py-2 rounded-md hover:bg-stone-50 transition-colors">
            Go home
          </Link>
          <Link href="/tasks" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors font-medium">
            Browse tasks
          </Link>
        </div>
      </div>
    </div>
  )
}
