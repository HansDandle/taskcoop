'use client'

import { useState, useTransition, useCallback } from 'react'
import { previewRecipients, sendBlast, type BlastFilters } from './actions'

const DEFAULT_FILTERS: BlastFilters = {
  role: 'all',
  idVerified: 'all',
  stripeOnboarded: 'all',
  inactiveDays: '',
}

export default function EmailBlastComposer() {
  const [filters, setFilters] = useState<BlastFilters>(DEFAULT_FILTERS)
  const [recipients, setRecipients] = useState<{ id: string; name: string; email: string }[] | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<{ sent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPreviewing, startPreview] = useTransition()
  const [isSending, startSend] = useTransition()

  const handlePreview = useCallback(() => {
    setError(null)
    setResult(null)
    startPreview(async () => {
      const data = await previewRecipients(filters)
      setRecipients(data)
    })
  }, [filters])

  function setFilter<K extends keyof BlastFilters>(key: K, value: BlastFilters[K]) {
    setFilters(f => ({ ...f, [key]: value }))
    setRecipients(null)
    setConfirming(false)
  }

  function handleSend() {
    setError(null)
    startSend(async () => {
      const res = await sendBlast(filters, subject, body)
      if (res.error) {
        setError(res.error)
        setConfirming(false)
      } else {
        setResult(res)
        setConfirming(false)
        setSubject('')
        setBody('')
        setRecipients(null)
      }
    })
  }

  return (
    <div className="space-y-8">

      {/* Filters */}
      <section className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Recipient filters</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Role</label>
            <select value={filters.role} onChange={e => setFilter('role', e.target.value as BlastFilters['role'])}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">All</option>
              <option value="customer">Customers</option>
              <option value="worker">Members</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">ID verified</label>
            <select value={filters.idVerified} onChange={e => setFilter('idVerified', e.target.value as BlastFilters['idVerified'])}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Either</option>
              <option value="yes">Verified</option>
              <option value="no">Not verified</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Stripe onboarded</label>
            <select value={filters.stripeOnboarded} onChange={e => setFilter('stripeOnboarded', e.target.value as BlastFilters['stripeOnboarded'])}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Either</option>
              <option value="yes">Onboarded</option>
              <option value="no">Not onboarded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Inactive for</label>
            <select value={filters.inactiveDays} onChange={e => setFilter('inactiveDays', e.target.value as BlastFilters['inactiveDays'])}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Any activity</option>
              <option value="30">30+ days</option>
              <option value="60">60+ days</option>
              <option value="90">90+ days</option>
              <option value="180">180+ days</option>
            </select>
          </div>
        </div>
        <button onClick={handlePreview} disabled={isPreviewing}
          className="mt-4 bg-stone-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
          {isPreviewing ? 'Loading…' : 'Preview recipients'}
        </button>
      </section>

      {/* Recipients preview */}
      {recipients !== null && (
        <section className="bg-white border border-stone-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            {recipients.length === 0 ? 'No recipients match' : `${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`}
            {recipients.length === 500 && <span className="ml-2 text-xs text-amber-600 font-normal">capped at 500</span>}
          </h2>
          {recipients.length > 0 && (
            <div className="max-h-48 overflow-y-auto text-xs text-stone-600 space-y-1">
              {recipients.map(r => (
                <div key={r.id} className="flex gap-3">
                  <span className="font-medium w-40 truncate">{r.name}</span>
                  <span className="text-stone-400">{r.email}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Composer */}
      <section className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Compose</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Subject line…"
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              rows={10} placeholder="Write your message here. Plain text only — line breaks are preserved."
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono resize-y" />
          </div>
        </div>
      </section>

      {/* Send */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && <p className="text-sm text-emerald-700 font-medium">Sent to {result.sent} recipient{result.sent !== 1 ? 's' : ''}.</p>}

      {!confirming ? (
        <button
          onClick={() => {
            if (!recipients || recipients.length === 0) { setError('Preview recipients first.'); return }
            if (!subject.trim() || !body.trim()) { setError('Subject and body are required.'); return }
            setError(null)
            setConfirming(true)
          }}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          Send blast
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-700">Send to <strong>{recipients?.length}</strong> people?</span>
          <button onClick={handleSend} disabled={isSending}
            className="bg-red-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            {isSending ? 'Sending…' : 'Yes, send'}
          </button>
          <button onClick={() => setConfirming(false)} className="text-sm text-stone-500 hover:underline">Cancel</button>
        </div>
      )}
    </div>
  )
}
