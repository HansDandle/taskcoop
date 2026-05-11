'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateProfile, submitIdVerification } from './actions'
import ImageUpload from '@/components/image-upload'
import MultiImageUpload from '@/components/multi-image-upload'
import MarkdownBio from '@/components/markdown-bio'
import FileUpload from '@/components/file-upload'

const initial = { error: '', success: false }

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initial)
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url ?? '')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(profile?.portfolio_urls ?? [])
  const [idUploading, setIdUploading] = useState(false)
  const [idSubmitted, setIdSubmitted] = useState(false)
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
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input value={email} disabled className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm bg-stone-50 text-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full name <span className="text-red-500">*</span></label>
            <input name="name" defaultValue={profile?.name ?? ''} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-stone-700">Bio</label>
          <div className="flex text-xs rounded-md overflow-hidden border border-stone-200">
            <button type="button" onClick={() => setBioPreview(false)}
              className={`px-3 py-1 transition-colors ${!bioPreview ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
              Write
            </button>
            <button type="button" onClick={() => setBioPreview(true)}
              className={`px-3 py-1 transition-colors ${bioPreview ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
              Preview
            </button>
          </div>
        </div>
        {bioPreview ? (
          <div className="min-h-[104px] w-full border border-stone-200 rounded-md px-3 py-2 bg-stone-50">
            {bioValue.trim()
              ? <MarkdownBio content={bioValue} />
              : <span className="text-stone-400 text-sm">Nothing to preview yet.</span>}
          </div>
        ) : (
          <textarea
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            rows={4}
            placeholder={'Tell people about yourself…\n\nSupports **bold**, _italic_, lists, and links.'}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        )}
        <input type="hidden" name="bio" value={bioValue} />
        <p className="mt-1 text-xs text-stone-400">Markdown supported: **bold**, _italic_, - lists, [links](url)</p>
      </div>

      {profile?.role === 'worker' && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
          <p className="text-xs text-stone-400 mb-3">Show off your work, yourself, your setup, whatever gives customers a feel for who you are. Up to 8 photos.</p>
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
        <p className="text-xs text-stone-500 mb-4">
          Verified members get a badge on their profile. Upload a government-issued ID (driver&apos;s license, passport, or state ID). Only admins can view it; it is never shown publicly.
        </p>
        {!profile.id_verified && profile.id_verification_status !== 'pending' && (
          idSubmitted ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              ID submitted. We&apos;ll review it shortly.
            </div>
          ) : (
            <FileUpload
              bucket="id-documents"
              folder={profile.id}
              existingUrl={profile.id_document_url}
              onUpload={(url) => {
                startIdTransition(async () => {
                  const fd = new FormData()
                  fd.set('id_document_url', url)
                  await submitIdVerification(fd)
                  setIdSubmitted(true)
                })
              }}
              accept="image/*,.pdf"
              label="Upload government ID"
            />
          )
        )}
      </div>
    )}
    </>
  )
}
