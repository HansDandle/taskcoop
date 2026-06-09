import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lead Finder Extension — TaskCoop',
  description: 'Find local task leads on Nextdoor, Facebook, Craigslist, and Reddit — all in one place.',
}

const PLATFORMS = [
  { name: 'Nextdoor',   color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Facebook',   color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Craigslist', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  { name: 'Reddit',     color: 'bg-orange-50 text-orange-800 border-orange-200' },
]

export default async function ExtensionPage() {
  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const isMobile = /mobile|android|iphone|ipad/i.test(ua)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Chrome Extension
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Stop missing leads on Nextdoor, Facebook, Craigslist, and Reddit
        </h1>
        <p className="text-stone-500 text-base max-w-lg mx-auto">
          The TaskCoop Lead Finder watches your feeds as you browse and surfaces task requests in one place. When you see a job you want, generate your offer reply in seconds.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {PLATFORMS.map(p => (
          <span key={p.name} className={`text-sm font-medium px-3 py-1 rounded-full border ${p.color}`}>
            {p.name}
          </span>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-6 text-center mb-10">
        {isMobile ? (
          <>
            <p className="font-semibold text-stone-900 mb-1">Extensions only work on desktop Chrome</p>
            <p className="text-stone-500 text-sm mb-4">
              We are working on a mobile app that does the same thing. Leave your email and we will let you know when it launches.
            </p>
            <form className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md font-semibold hover:bg-emerald-700 transition-colors"
              >
                Notify me
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="font-semibold text-stone-900 mb-1">Free to install</p>
            <p className="text-stone-500 text-sm mb-4">
              Works on Chrome, Edge, and Brave. No account required to install.
            </p>
            <a
              href="#"
              className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Add to Chrome — it&apos;s free
            </a>
            <p className="text-xs text-stone-400 mt-3">
              Chrome Web Store listing coming soon.{' '}
              <Link href="https://github.com/HansDandle/taskcoop/tree/main/extension" className="underline">
                Install the development version instead.
              </Link>
            </p>
          </>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-stone-900">How it works</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {[
            ['Install and browse normally', 'Once installed, just use Nextdoor, Facebook Groups, Craigslist, and Reddit as you normally would. No extra steps.'],
            ['Leads appear automatically', 'The extension reads your feed as it loads and flags posts where someone is looking for help. The toolbar icon shows a count of new leads.'],
            ['Click "Offer to help"', 'Opens TaskCoop with the post pre-filled. Set your price and get a ready-to-paste reply that includes your booking link, your price, and your escrow protection.'],
            ['Paste it and get booked', 'Post your reply on the original platform. When the requester clicks your link and books, payment is held in escrow until the job is done.'],
          ].map(([title, desc], i) => (
            <div key={i} className="px-5 py-4 flex gap-4">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-stone-900 text-sm">{title}</p>
                <p className="text-sm text-stone-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg px-5 py-4 text-sm text-stone-600">
        <p className="font-medium text-stone-800 mb-1">Your data stays on your device</p>
        <p>
          The extension reads your feed locally. Leads are stored in your browser and never sent to TaskCoop servers unless you choose to make an offer. We do not collect your Nextdoor, Facebook, Craigslist, or Reddit credentials or activity.
        </p>
      </div>

    </div>
  )
}
