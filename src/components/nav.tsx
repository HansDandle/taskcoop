'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signout } from '@/app/auth/actions'

type User = {
  id: string
  email?: string
  name?: string
  role?: string
} | null

export default function Nav({ user, dashboardAlert }: { user: User; dashboardAlert?: boolean }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-semibold text-lg tracking-tight text-stone-900">
          task<span className="text-emerald-600">.coop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600">
          <Link href="/tasks" className={pathname === '/tasks' ? 'text-stone-900 font-medium' : 'hover:text-stone-900'}>Browse Tasks</Link>
          <Link href="/how-it-works" className={pathname === '/how-it-works' ? 'text-stone-900 font-medium' : 'hover:text-stone-900'}>How It Works</Link>
          <Link href="/blog" className={pathname.startsWith('/blog') ? 'text-stone-900 font-medium' : 'hover:text-stone-900'}>Blog</Link>
          <Link href="/cooperative" className={pathname === '/cooperative' ? 'text-stone-900 font-medium' : 'hover:text-stone-900'}>About</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'text-stone-900 font-medium' : 'hover:text-stone-900'}>Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="relative text-sm text-stone-600 hover:text-stone-900">
                Dashboard
                {dashboardAlert && <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" aria-label="New activity" />}
              </Link>
              {user.role === 'customer' && (
                <Link href="/tasks/new" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
                  Post a Task
                </Link>
              )}
              <form action={signout}>
                <button type="submit" className="text-sm text-stone-500 hover:text-stone-900">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900">Sign in</Link>
              <Link href="/signup" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-3"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <div className="w-5 h-0.5 bg-stone-700 mb-1" aria-hidden="true" />
          <div className="w-5 h-0.5 bg-stone-700 mb-1" aria-hidden="true" />
          <div className="w-5 h-0.5 bg-stone-700" aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3 text-sm">
          <Link href="/tasks" className="block text-stone-700" onClick={() => setMenuOpen(false)}>Browse Tasks</Link>
          <Link href="/how-it-works" className="block text-stone-700" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/blog" className="block text-stone-700" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/cooperative" className="block text-stone-700" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/contact" className="block text-stone-700" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-stone-700" onClick={() => setMenuOpen(false)}>
                Dashboard
                {dashboardAlert && <span className="w-2 h-2 bg-red-500 rounded-full" aria-label="New activity" />}
              </Link>
              {user.role === 'customer' && (
                <Link href="/tasks/new" className="block text-stone-700" onClick={() => setMenuOpen(false)}>Post a Task</Link>
              )}
              <form action={signout}>
                <button type="submit" className="text-stone-500">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-stone-700" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/signup" className="block font-medium text-emerald-600" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
