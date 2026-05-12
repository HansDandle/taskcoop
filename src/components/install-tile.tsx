'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallTile() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    // iOS Safari doesn't fire beforeinstallprompt — detect manually
    const ua = window.navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) setIsIos(true)

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed) return null

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
  }

  // Show iOS instructions
  if (isIos && !installPrompt) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
        <p className="text-sm font-semibold text-emerald-900">📱 Install task.coop on your phone</p>
        <p className="text-xs text-emerald-700 mt-1">
          Tap the <strong>Share</strong> button in Safari, then <strong>Add to Home Screen</strong>. You&apos;ll get one-tap access to offers and messages.
        </p>
      </div>
    )
  }

  if (!installPrompt) return null

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-emerald-900">📱 Install task.coop on your phone</p>
        <p className="text-xs text-emerald-700 mt-1">One-tap access to offers, messages, and dashboard.</p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
      >
        Install
      </button>
    </div>
  )
}
