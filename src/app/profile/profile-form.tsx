'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateProfile, submitIdVerification } from './actions'
import ImageUpload from '@/components/image-upload'
import MultiImageUpload from '@/components/multi-image-upload'
import MarkdownBio from '@/components/markdown-bio'
import FileUpload from '@/components/file-upload'
import MultiFileUpload, { type LicenseEntry } from '@/components/multi-file-upload'

const initial = { error: '', success: false }

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initial)
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url ?? '')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(profile?.portfolio_urls ?? [])
  const [idDocPath, setIdDocPath] = useState<string>(profile?.id_document_url ?? '')
  const [idSelfiePath, setIdSelfiePath] = useState<string>(profile?.id_selfie_url ?? '')
  const [licenses, setLicenses] = useState<LicenseEntry[]>(
    Array.isArray(profile?.professional_licenses) ? profile.professional_licenses : []
  )
  const [idSubmitted, setIdSubmitted] = useState(false)
  const [licensesSaved, setLicensesSaved] = useState(false)
  const [idError, setIdError] = useState('')
  const [idPending, startIdTransition] = useTransition()
  const [bioPreview, setBioPreview] = useState(false)
  const [bioValue, setBioValue] = useState<string>(profile?.bio ?? '')

  return (
    <>
    <form action={action} className="space-y-6">
      <input type="hidden" name="avatar_url" value={avatarUrl} />
      <input type="hidden" name="portfolio_urls" value={JSON.stringify(portfolioUrls)} />

      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="w-24 shrink-0">
          <ImageUpload
            bucket="avatars"
            folder={profile?.id}
            existingUrl={profile?.avatar_url}
            onUpload={setAvatarUrl}
            shape="circle"
            label="Photo"
          />
        </div>
        <div className="flex-1 space-y-4 pt-1">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input id="email" value={email} disabled className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm bg-stone-50 text-stone-500" />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Full name <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
            <input id="name" name="name" defaultValue={profile?.name ?? ''} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="bio" className="block text-sm font-medium text-stone-700">Bio</label>
          <div className="flex text-xs rounded-md overflow-hidden border border-stone-200" role="group" aria-label="Bio editor mode">
            <button type="button" onClick={() => setBioPreview(false)} aria-pressed={!bioPreview}
              className={`px-3 py-1 transition-colors ${!bioPreview ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
              Write
            </button>
            <button type="button" onClick={() => setBioPreview(true)} aria-pressed={bioPreview}
              className={`px-3 py-1 transition-colors ${bioPreview ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
              Preview
            </button>
          </div>
        </div>
        {bioPreview ? (
          <div className="min-h-[104px] w-full border border-stone-200 rounded-md px-3 py-2 bg-stone-50" role="region" aria-label="Bio preview">
            {bioValue.trim()
              ? <MarkdownBio content={bioValue} />
              : <span className="text-stone-500 text-sm">Nothing to preview yet.</span>}
          </div>
        ) : (
          <textarea
            id="bio"
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            rows={4}
            placeholder={'Tell people about yourself…\n\nSupports **bold**, _italic_, lists, and links.'}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        )}
        <input type="hidden" name="bio" value={bioValue} />
        <p className="mt-1 text-sm text-stone-500">Markdown supported: **bold**, _italic_, - lists, [links](url)</p>
      </div>

      {profile?.role === 'worker' && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
          <p className="text-sm text-stone-600 mb-3">Show off your work, yourself, your setup, whatever gives customers a feel for who you are. Up to 8 photos.</p>
          <MultiImageUpload
            bucket="portfolio"
            folder={profile?.id}
            existingUrls={profile?.portfolio_urls ?? []}
            onChange={setPortfolioUrls}
            max={8}
            label="Add photo"
          />
        </div>
      )}

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{state.error}</div>}
      {state?.success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">Profile updated.</div>}

      <button type="submit" disabled={pending} className="w-full bg-emerald-600 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60">
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>

    {/* ID Verification — members only */}
    {profile?.role === 'worker' && (
      <div className="mt-8 border border-stone-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-stone-900">ID Verification</h3>
          {profile.id_verified && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
          )}
          {profile.id_verification_status === 'pending' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Under review</span>
          )}
          {profile.id_verification_status === 'rejected' && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Rejected; please resubmit</span>
          )}
        </div>
        <p className="text-sm text-stone-600 mb-5">
          Verified members get a badge on their profile. ID and selfie are private — only admins can view them and they&apos;re never shown publicly. Approved license titles (e.g. &ldquo;Notary Commission&rdquo;) appear on your public profile to help customers trust your offer.
        </p>

        {/* Fully-verified-with-selfie members: show a quiet panel for managing licenses only. */}
        {profile.id_verified && profile.id_selfie_url && !idSubmitted && profile.id_verification_status !== 'pending' ? (
          <div className="space-y-4">
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              Your ID and selfie are verified. Add or update professional licenses below — we&apos;ll review each one separately.
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Professional licenses & certifications</label>
              <p className="text-sm text-stone-600 mb-2">Approved titles appear on your public profile.</p>
              <MultiFileUpload
                bucket="id-documents"
                folder={`${profile.id}/license`}
                existing={licenses}
                onChange={setLicenses}
                max={8}
                accept="image/*,.pdf"
              />
            </div>
            {idError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{idError}</div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={idPending}
                onClick={() => {
                  setIdError('')
                  setLicensesSaved(false)
                  startIdTransition(async () => {
                    const fd = new FormData()
                    fd.set('id_document_url', idDocPath)
                    fd.set('id_selfie_url', idSelfiePath)
                    fd.set('professional_licenses', JSON.stringify(licenses))
                    const result = await submitIdVerification(fd)
                    if (result?.error) setIdError(result.error)
                    else setLicensesSaved(true)
                  })
                }}
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium disabled:opacity-60"
              >
                {idPending ? 'Saving…' : 'Save license changes'}
              </button>
              {licensesSaved && !idPending && (
                <span className="text-xs text-emerald-700">Saved — new licenses pending admin review.</span>
              )}
            </div>
          </div>
        ) : profile.id_verification_status === 'pending' && !idSubmitted ? (
          <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Your documents are under review. We&apos;ll email you once they&apos;re approved.
          </div>
        ) : idSubmitted ? (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            Documents submitted. We&apos;ll review them shortly.
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Photo of your government ID <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span>
              </label>
              <p className="text-sm text-stone-600 mb-2">Driver&apos;s license, passport, or state ID. Make sure all four corners are visible and text is readable.</p>
              <FileUpload
                bucket="id-documents"
                folder={`${profile.id}/id`}
                existingUrl={idDocPath}
                onUpload={setIdDocPath}
                accept="image/*,.pdf"
                label="Upload ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Selfie holding your ID <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span>
              </label>
              <p className="text-sm text-stone-600 mb-2">A photo of you holding the same ID next to your face. Both your face and the ID must be clearly visible.</p>
              <FileUpload
                bucket="id-documents"
                folder={`${profile.id}/selfie`}
                existingUrl={idSelfiePath}
                onUpload={setIdSelfiePath}
                accept="image/*"
                label="Upload selfie with ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Professional licenses & certifications</label>
              <p className="text-sm text-stone-600 mb-2">Optional. Notary commission, contractor license, pet care certifications, etc. Title each one — approved titles show on your public profile.</p>
              <MultiFileUpload
                bucket="id-documents"
                folder={`${profile.id}/license`}
                existing={licenses}
                onChange={setLicenses}
                max={8}
                accept="image/*,.pdf"
              />
            </div>

            {idError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{idError}</div>
            )}

            <button
              type="button"
              disabled={idPending || !idDocPath || !idSelfiePath}
              onClick={() => {
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
              }}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {idPending ? 'Submitting…' : 'Submit for review'}
            </button>
            {(!idDocPath || !idSelfiePath) && (
              <p className="text-sm text-stone-500 text-center -mt-3">Upload both your ID and a selfie to submit.</p>
            )}
          </div>
        )}
      </div>
    )}
    </>
  )
}
