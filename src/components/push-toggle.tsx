'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)))
}

type Status = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

export default function PushToggle() {
  const [status, setStatus] = useState<Status>('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      setStatus(existing ? 'subscribed' : 'unsubscribed')
    })
  }, [])

  const enable = async () => {
    if (!VAPID_PUBLIC) {
      setError('Push notifications are not configured.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'unsubscribed')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      if (!res.ok) throw new Error('Server rejected subscription')
      setStatus('subscribed')
    } catch (err: any) {
      setError(err.message ?? 'Could not enable notifications')
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    setError('')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setStatus('unsubscribed')
    } catch (err: any) {
      setError(err.message ?? 'Could not disable notifications')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return null

  if (status === 'unsupported') {
    return (
      <div className="bg-white border border-stone-200 rounded-lg px-5 py-4">
        <p className="text-sm font-semibold text-stone-900">Push notifications</p>
        <p className="text-xs text-stone-500 mt-1">Your browser doesn&apos;t support push notifications. Install task.coop to your home screen on iOS, or use Chrome/Edge/Safari on desktop.</p>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="bg-white border border-stone-200 rounded-lg px-5 py-4">
        <p className="text-sm font-semibold text-stone-900">Push notifications blocked</p>
        <p className="text-xs text-stone-500 mt-1">You&apos;ve blocked notifications for this site. Re-enable them in your browser settings to receive alerts about new offers and messages.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-900">
          {status === 'subscribed' ? 'Notifications are on' : 'Turn on notifications'}
        </p>
        <p className="text-xs text-stone-500 mt-1">
          {status === 'subscribed'
            ? 'You\'ll get alerts about new offers, accepted offers, and messages.'
            : 'Get instant alerts about new offers, accepted offers, and messages.'}
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        onClick={status === 'subscribed' ? disable : enable}
        disabled={busy}
        className={`shrink-0 text-sm px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-60 ${
          status === 'subscribed'
            ? 'border border-stone-300 text-stone-700 hover:border-stone-500'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {busy ? '…' : status === 'subscribed' ? 'Turn off' : 'Turn on'}
      </button>
    </div>
  )
}
