'use client'

import { useActionState, useState } from 'react'
import { updateProfile } from './actions'
import ImageUpload from '@/components/image-upload'
import MultiImageUpload from '@/components/multi-image-upload'
import MarkdownBio from '@/components/markdown-bio'

const initial = { error: '', success: false }

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initial)
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url ?? '')
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(profile?.portfolio_urls ?? [])
  const [bioPreview, setBioPreview] = useState(false)
  const [bioValue, setBioValue] = useState<string>(profile?.bio ?? '')

  return (
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
  )
}
