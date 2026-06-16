'use client'

import { useState, useTransition } from 'react'
import FileUpload from '@/components/file-upload'
import MultiFileUpload, { type LicenseEntry } from '@/components/multi-file-upload'
import { submitIdVerification, saveIdDraft } from '@/app/profile/actions'

type VerificationProfile = {
  id: string
  id_verified?: boolean | null
  id_verification_status?: string | null
  id_document_url?: string | null
  id_selfie_url?: string | null
  professional_licenses?: LicenseEntry[] | null
}

// Self-contained, guided ID-verification flow. Used on the dedicated /verify page.
// Files upload to a private bucket the moment they're picked; saveIdDraft records
// them on the user row immediately so a half-finished applicant is never lost.
export default function IdVerification({ profile }: { profile: VerificationProfile }) {
  const [idDocPath, setIdDocPath] = useState<string>(profile?.id_document_url ?? '')
  const [idSelfiePath, setIdSelfiePath] = useState<string>(profile?.id_selfie_url ?? '')
  const [licenses, setLicenses] = useState<LicenseEntry[]>(
    Array.isArray(profile?.professional_licenses) ? profile.professional_licenses : []
  )
  const [idSubmitted, setIdSubmitted] = useState(false)
  const [licensesSaved, setLicensesSaved] = useState(false)
  const [idError, setIdError] = useState('')
  const [idPending, startIdTransition] = useTransition()

  const saveDraft = (fields: Record<string, string>) => {
    const fd = new FormData()
    for (const [k, v] of Object.entries(fields)) fd.set(k, v)
    void saveIdDraft(fd)
  }

  const hasId = !!idDocPath
  const hasSelfie = !!idSelfiePath
  const canSubmit = hasId && hasSelfie && !idPending

  const submit = () => {
    setIdError('')
    startIdTransition(async () => {
      const fd = new FormData()
      fd.set('id_document_url', idDocPath)
      fd.set('id_selfie_url', idSelfiePath)
      fd.set('professional_licenses', JSON.stringify(licenses))
      const result = await submitIdVerification(fd)
      if (result?.error) setIdError(result.error)
      else setIdSubmitted(true)
    })
  }

  const status = profile?.id_verification_status

  // Already verified with a selfie on file: nothing to do but manage licenses.
  if (profile?.id_verified && profile?.id_selfie_url && !idSubmitted && status !== 'pending') {
    return (
      <div className="space-y-4">
        <StatusBadge verified />
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          Your ID and selfie are verified. Add or update professional licenses below; we&apos;ll review each one separately.
        </div>
        <LicensePanel
          folder={`${profile.id}/license`}
          licenses={licenses}
          onChange={(next) => { setLicenses(next); saveDraft({ professional_licenses: JSON.stringify(next) }) }}
        />
        {idError && <ErrorNote text={idError} />}
        <div className="flex items-center gap-3">
          <button type="button" disabled={idPending} onClick={() => {
            setIdError(''); setLicensesSaved(false)
            startIdTransition(async () => {
              const fd = new FormData()
              fd.set('id_document_url', idDocPath)
              fd.set('id_selfie_url', idSelfiePath)
              fd.set('professional_licenses', JSON.stringify(licenses))
              const result = await submitIdVerification(fd)
              if (result?.error) setIdError(result.error)
              else setLicensesSaved(true)
            })
          }} className="text-sm text-emerald-700 hover:text-emerald-800 font-medium disabled:opacity-60">
            {idPending ? 'Saving…' : 'Save license changes'}
          </button>
          {licensesSaved && !idPending && <span className="text-xs text-emerald-700">Saved; new licenses pending review.</span>}
        </div>
      </div>
    )
  }

  // Under review.
  if (status === 'pending' && !idSubmitted) {
    return (
      <div className="space-y-4">
        <StatusBadge pending />
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
          Your documents are under review. We&apos;ll email you once they&apos;re approved, usually within a day.
        </div>
      </div>
    )
  }

  // Just submitted this session.
  if (idSubmitted) {
    return (
      <div className="space-y-4">
        <StatusBadge pending />
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3">
          ✓ Documents submitted. We&apos;ll review them shortly and email you when you&apos;re verified.
        </div>
      </div>
    )
  }

  // Guided upload flow.
  return (
    <div className="space-y-6">
      {status === 'rejected' && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          Your last submission was rejected. Please re-upload a clearer photo of your ID and a selfie holding it, then submit again.
        </div>
      )}

      {/* Progress */}
      <ol className="flex items-center gap-2 text-xs font-medium">
        <ProgressPill n={1} label="Photo ID" done={hasId} />
        <span className="text-stone-300" aria-hidden="true">—</span>
        <ProgressPill n={2} label="Selfie" done={hasSelfie} />
        <span className="text-stone-300" aria-hidden="true">—</span>
        <ProgressPill n={3} label="Submit" done={false} />
      </ol>

      <Step n={1} title="Photo of your government ID" done={hasId}>
        <p className="text-sm text-stone-600 mb-2">Driver&apos;s license, passport, or state ID. Lay it flat, make sure all four corners are visible and the text is readable. Photo or PDF, up to 10 MB.</p>
        <FileUpload
          bucket="id-documents"
          folder={`${profile.id}/id`}
          existingUrl={idDocPath}
          onUpload={(url) => { setIdDocPath(url); saveDraft({ id_document_url: url }) }}
          accept="image/*,.pdf"
          label="Upload ID"
        />
      </Step>

      <Step n={2} title="Selfie holding your ID" done={hasSelfie}>
        <p className="text-sm text-stone-600 mb-2">A photo of you holding that same ID up next to your face. Both your face and the ID must be clearly readable in the same shot.</p>
        <div className="mb-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
          <p className="font-medium text-stone-700 mb-1">Tips for a selfie that passes the first time</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Good lighting, no glare on the ID</li>
            <li>Hold the ID steady so the text is sharp, not blurry</li>
            <li>Don&apos;t cover any part of the ID with your fingers</li>
            <li>iPhone photos work; we&apos;ll handle the format</li>
          </ul>
        </div>
        <FileUpload
          bucket="id-documents"
          folder={`${profile.id}/selfie`}
          existingUrl={idSelfiePath}
          onUpload={(url) => { setIdSelfiePath(url); saveDraft({ id_selfie_url: url }) }}
          accept="image/*"
          label="Upload selfie with ID"
        />
      </Step>

      <Step n={3} title="Professional licenses" optional done={licenses.length > 0}>
        <p className="text-sm text-stone-600 mb-2">Optional. Notary commission, contractor license, pet-care certifications, etc. Title each one; approved titles show on your public profile.</p>
        <LicensePanel
          folder={`${profile.id}/license`}
          licenses={licenses}
          onChange={(next) => { setLicenses(next); saveDraft({ professional_licenses: JSON.stringify(next) }) }}
        />
      </Step>

      {idError && <ErrorNote text={idError} />}

      <div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          {idPending ? 'Submitting…' : 'Submit for review'}
        </button>
        {!canSubmit && !idPending && (
          <p className="text-sm text-stone-500 text-center mt-2">
            {!hasId && !hasSelfie ? 'Upload your ID and a selfie to submit.'
              : !hasId ? 'Upload your ID to submit.'
              : 'Add a selfie holding your ID to submit.'}
          </p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ verified, pending }: { verified?: boolean; pending?: boolean }) {
  if (verified) return <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
  if (pending) return <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Under review</span>
  return null
}

function ProgressPill({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <li className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${done ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-white'}`}>
        {done ? '✓' : n}
      </span>
      {label}
    </li>
  )
}

function Step({ n, title, done, optional, children }: { n: number; title: string; done: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
          {done ? '✓' : n}
        </span>
        <h3 className="font-medium text-stone-900 text-sm">{title}</h3>
        {optional && <span className="text-xs text-stone-400">(optional)</span>}
      </div>
      <div className="pl-8">{children}</div>
    </div>
  )
}

function LicensePanel({ folder, licenses, onChange }: { folder: string; licenses: LicenseEntry[]; onChange: (e: LicenseEntry[]) => void }) {
  return (
    <MultiFileUpload
      bucket="id-documents"
      folder={folder}
      existing={licenses}
      onChange={onChange}
      max={8}
      accept="image/*,.pdf"
    />
  )
}

function ErrorNote({ text }: { text: string }) {
  return <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{text}</div>
}
