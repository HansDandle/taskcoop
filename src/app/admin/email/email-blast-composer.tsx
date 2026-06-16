'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { previewRecipients, sendBlast, type BlastFilters } from './actions'

const TOKENS = [
  { label: '{{name}}', description: "Recipient's name" },
  { label: '{{email}}', description: "Recipient's email" },
]

const DEFAULT_FILTERS: BlastFilters = {
  role: 'all',
  idStatus: 'all',
  stripeOnboarded: 'all',
  inactiveDays: '',
}

// Drop-in starting points: each sets the recipient filters plus a draft subject/body.
// Everything stays editable after applying. Keep copy free of em dashes.
const TEMPLATES: {
  key: string
  label: string
  description: string
  filters: Partial<BlastFilters>
  subject: string
  body: string
}[] = [
  {
    key: 'verified-no-stripe',
    label: 'ID verified, no payouts',
    description: 'Verified members who have not connected Stripe',
    filters: { role: 'worker', idStatus: 'verified', stripeOnboarded: 'no' },
    subject: "You're verified, one step left to get paid",
    body: `Hi {{name}},

Good news: your ID is verified on task.coop, so you're almost ready to start earning.

The last step is connecting your payout account through Stripe so we can send your money securely. It takes about two minutes.

Open your dashboard and choose "Set up payouts" to finish.

Thanks for being part of the cooperative,
The task.coop team`,
  },
  {
    key: 'id-incomplete',
    label: 'ID verification incomplete',
    description: 'Uploaded an ID and/or selfie but not yet verified',
    filters: { role: 'worker', idStatus: 'incomplete' },
    subject: 'Finish your ID verification on task.coop',
    body: `Hi {{name}},

Thanks for starting your ID verification. It isn't quite complete yet, so your account isn't verified.

To finish, please make sure you've uploaded both a clear photo of your ID and a selfie from your profile page. Once both are in, our team will review and approve you, usually within a day.

Open your profile to wrap it up.

Thanks,
The task.coop team`,
  },
  {
    key: 'no-id-no-stripe',
    label: 'No ID, no payouts',
    description: 'Members who have not started ID verification or Stripe',
    filters: { role: 'worker', idStatus: 'none', stripeOnboarded: 'no' },
    subject: 'Two quick steps to start earning on task.coop',
    body: `Hi {{name}},

Welcome to task.coop. To start accepting tasks and getting paid, there are two quick things to set up:

1. Verify your identity by uploading your ID and a selfie. This keeps the community safe.
2. Connect your payout account through Stripe so we can pay you securely.

Both take just a few minutes from your profile and dashboard.

We're glad you're here,
The task.coop team`,
  },
]

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
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  function insertToken(token: string, field: 'subject' | 'body') {
    if (field === 'subject') {
      const el = document.querySelector<HTMLInputElement>('input[name="subject"]')
      if (!el) return
      const start = el.selectionStart ?? subject.length
      const end = el.selectionEnd ?? subject.length
      const next = subject.slice(0, start) + token + subject.slice(end)
      setSubject(next)
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length) })
    } else {
      const el = bodyRef.current
      if (!el) return
      const start = el.selectionStart ?? body.length
      const end = el.selectionEnd ?? body.length
      const next = body.slice(0, start) + token + body.slice(end)
      setBody(next)
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length) })
    }
  }

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

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setFilters({ ...DEFAULT_FILTERS, ...t.filters })
    setSubject(t.subject)
    setBody(t.body)
    setRecipients(null)
    setConfirming(false)
    setResult(null)
    setError(null)
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

      {/* Templates */}
      <section className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-1">Templates</h2>
        <p className="text-xs text-stone-500 mb-4">Drop in a starting point. Filters and copy stay editable.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TEMPLATES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => applyTemplate(t)}
              className="text-left border border-stone-200 rounded-md p-3 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
            >
              <div className="text-sm font-medium text-stone-800">{t.label}</div>
              <div className="text-xs text-stone-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      </section>

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
            <label className="block text-xs text-stone-500 mb-1">ID status</label>
            <select value={filters.idStatus} onChange={e => setFilter('idStatus', e.target.value as BlastFilters['idStatus'])}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Any</option>
              <option value="verified">Verified</option>
              <option value="incomplete">Incomplete (uploaded, not verified)</option>
              <option value="none">None uploaded</option>
              <option value="unverified">Any not verified</option>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-700">Compose</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400 mr-1">Insert:</span>
            {TOKENS.map(t => (
              <div key={t.label} className="flex gap-px">
                <button type="button" title={`Insert into subject: ${t.description}`}
                  onClick={() => insertToken(t.label, 'subject')}
                  className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded-l font-mono border border-stone-200 border-r-0">
                  {t.label}
                </button>
                <button type="button" title={`Insert into body: ${t.description}`}
                  onClick={() => insertToken(t.label, 'body')}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-1.5 py-1 rounded-r border border-emerald-200 font-medium">
                  body
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Subject</label>
            <input name="subject" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Subject line…"
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Body</label>
            <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)}
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
