'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa-install-dismissed'

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Register service worker and check for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.update().catch(() => {})
        // Reload once when a new SW takes control
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        })
      }).catch(() => {})
    }

    // Don't show again if previously dismissed within 30 days
    const dismissed = typeof window !== 'undefined' ? localStorage.getItem(DISMISSED_KEY) : null
    if (dismissed && Date.now() - Number(dismissed) < 30 * 24 * 60 * 60 * 1000) return

    // Don't show in standalone (already installed)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as InstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setVisible(false)
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-40 bg-white border border-stone-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900">Install task.coop</p>
        <p className="text-xs text-stone-500 mt-0.5">Add to your home screen for faster access.</p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-md hover:bg-emerald-700 transition-colors"
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-stone-400 hover:text-stone-600 text-lg leading-none px-1"
      >
        ×
      </button>
    </div>
  )
}
