import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { APP_URL } from '@/lib/urls'
import NextdoorOfferForm from './offer-form'

export const metadata: Metadata = { title: 'Lead Feed — TaskCoop' }

const MOCK_POSTS = [
  {
    id: 'nd-mock-001',
    title: 'Need help moving a sectional this Saturday',
    body: "Hey neighbors — I have a large sectional couch that needs to go from my living room to the garage to make space for a renovation. It's heavy and I can't do it alone. Looking for someone available this Saturday or Sunday morning. Happy to pay fair.",
    category: 'Moving Help',
    neighborhood: 'South Congress',
    postedAt: '2h ago',
    reactions: 4,
    comments: 3,
    externalUrl: 'https://nextdoor.com',
  },
  {
    id: 'nd-mock-002',
    title: 'Anyone good at furniture assembly? Have 3 IKEA pieces',
    body: "Picked up a KALLAX shelf, a HEMNES dresser, and a BILLY bookcase. Not exactly handy myself. Would love someone who knows their way around an Allen wrench. Flexible on timing this week.",
    category: 'Furniture Assembly',
    neighborhood: 'Travis Heights',
    postedAt: '5h ago',
    reactions: 2,
    comments: 1,
    externalUrl: 'https://nextdoor.com',
  },
  {
    id: 'nd-mock-003',
    title: 'Yard overgrown — need cleanup before HOA inspection',
    body: "My backyard got away from me this spring. Needs mowing, edging, and a bunch of overgrown bushes trimmed back. HOA inspection is in 10 days. Looking for someone reliable who can get it done this week.",
    category: 'Yard Work',
    neighborhood: 'Bouldin Creek',
    postedAt: '1d ago',
    reactions: 6,
    comments: 4,
    externalUrl: 'https://nextdoor.com',
  },
  {
    id: 'nd-mock-004',
    title: 'Need a handyman for a few small fixes around the house',
    body: "A few things piled up — a door that won't latch, a leaky faucet, and a ceiling fan that needs to come down. Nothing major but I'm useless with tools. Happy to pay by the hour.",
    category: 'Handyman',
    neighborhood: 'Zilker',
    postedAt: '1d ago',
    reactions: 1,
    comments: 2,
    externalUrl: 'https://nextdoor.com',
  },
  {
    id: 'nd-mock-005',
    title: 'Deep clean needed before I list my house',
    body: "Getting ready to list and want a thorough cleaning — kitchen appliances, bathrooms, baseboards, the works. House is about 1,400 sq ft. Looking for someone experienced and can work this weekend.",
    category: 'Cleaning',
    neighborhood: 'Barton Hills',
    postedAt: '2d ago',
    reactions: 3,
    comments: 5,
    externalUrl: 'https://nextdoor.com',
  },
]

function resolveNextdoorUrl(url: string | undefined, title: string): string {
  if (!url) return `https://nextdoor.com/search/posts/?query=${encodeURIComponent(title.slice(0, 80))}`
  try {
    const u = new URL(url)
    if (u.hostname !== 'nextdoor.com' && u.hostname !== 'www.nextdoor.com') return url
    // Generic feed/search pages — build a post search from the title instead
    if (!u.pathname.startsWith('/p/') && !u.pathname.startsWith('/search/posts')) {
      return `https://nextdoor.com/search/posts/?query=${encodeURIComponent(title.slice(0, 80))}`
    }
    return url
  } catch {
    return url
  }
}

function HowItWorks({ profile }: { profile: { name: string; bio: string | null; id_verified: boolean } }) {
  const bioExcerpt = profile.bio
    ? profile.bio.slice(0, 100) + (profile.bio.length > 100 ? '…' : '')
    : 'experienced and reliable, ready to help'

  const sampleUrl = `${APP_URL}/tasks/xxxxxxx`

  return (
    <details open className="bg-white border border-stone-200 rounded-lg overflow-hidden mb-8 group">
      <summary className="px-5 py-4 border-b border-stone-200 cursor-pointer list-none flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stone-900">How the Lead Feed works</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            People post tasks on Nextdoor, Facebook, Reddit, and Craigslist every day. Here&apos;s how to win those jobs through TaskCoop.
          </p>
        </div>
        <span className="text-stone-400 text-xs ml-4 shrink-0 group-open:hidden">Show</span>
        <span className="text-stone-400 text-xs ml-4 shrink-0 hidden group-open:inline">Hide</span>
      </summary>

      <div className="divide-y divide-stone-100">
        <div className="px-5 py-4 flex gap-4">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">1</div>
          <div>
            <p className="font-medium text-stone-900 text-sm">Browse posts near you</p>
            <p className="text-sm text-stone-500 mt-0.5">
              The feed below shows posts from Nextdoor, Facebook, Reddit, and Craigslist where people are looking for help — the same kinds of jobs you already do.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-4">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">2</div>
          <div>
            <p className="font-medium text-stone-900 text-sm">Set your price — we write your reply</p>
            <p className="text-sm text-stone-500 mt-0.5">
              Click &ldquo;Offer to help&rdquo; on any post, enter what you&apos;d charge, and TaskCoop generates a ready-to-paste reply:
            </p>
            <div className="mt-3 bg-stone-50 border border-stone-200 rounded-md p-3 text-sm text-stone-700 font-mono leading-relaxed">
              <span className="text-emerald-700 font-semibold">Book me:</span> {sampleUrl}
              <br /><br />
              I&apos;m {bioExcerpt} and I&apos;ll do it for $[your price]. Payment is escrowed — you pay nothing until you mark the job complete.{profile.id_verified ? ' My ID is also verified by TaskCoop.' : ''}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-4">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">3</div>
          <div>
            <p className="font-medium text-stone-900 text-sm">Paste your reply — they click your link</p>
            <p className="text-sm text-stone-500 mt-0.5">
              Your reply stands out. You&apos;re not just saying &ldquo;I can help!&rdquo; — you&apos;re giving them a direct booking link, a clear price, and proof that payment is protected.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-4">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">4</div>
          <div>
            <p className="font-medium text-stone-900 text-sm">They book — you&apos;re protected</p>
            <p className="text-sm text-stone-500 mt-0.5">
              When they click the link and accept your offer on TaskCoop, payment is held in escrow. You do the job, they release the funds. No chasing cash, no he-said-she-said.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-stone-50 border-t border-stone-200">
        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-2">Why route through TaskCoop?</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="text-sm">
            <p className="font-medium text-stone-800">Guaranteed payment</p>
            <p className="text-stone-500 text-xs mt-0.5">Funds are held before you show up. No payment, no ghost.</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-stone-800">You win the job</p>
            <p className="text-stone-500 text-xs mt-0.5">A verified ID + escrow beats a random &ldquo;I can help&rdquo; reply every time.</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-stone-800">Reviews that compound</p>
            <p className="text-stone-500 text-xs mt-0.5">Every job builds your reputation. Each new job is easier to land.</p>
          </div>
        </div>
      </div>
    </details>
  )
}

function PostCard({
  post,
  profile,
}: {
  post: typeof MOCK_POSTS[number] & { platform?: string | null }
  profile: { name: string; bio: string | null; id_verified: boolean }
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500 mb-1">
            <span className="font-medium text-stone-600">{post.neighborhood}</span>
            <span>·</span>
            <span>{post.category}</span>
            <span>·</span>
            <span>{post.postedAt}</span>
          </div>
          <h3 className="font-semibold text-stone-900">{post.title}</h3>
          <p className="text-sm text-stone-600 mt-1 line-clamp-3">{post.body}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
            <span>{post.reactions} reactions</span>
            <span>{post.comments} comments</span>
            {post.externalUrl && (
              <a
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-600 hover:underline"
              >
                {post.platform === 'nextdoor' || !post.platform ? 'View on Nextdoor →' : 'View original post →'}
              </a>
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full capitalize">
          {post.platform ?? 'Nextdoor'}
        </span>
      </div>
      <NextdoorOfferForm post={post} profile={profile} />
    </div>
  )
}

export default async function NextdoorFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; platform?: string; title?: string; body?: string; url?: string; location?: string; id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/leadfeed')

  const { data: profile } = await supabase
    .from('users')
    .select('role, name, bio, id_verified, stripe_onboarded, reply_template')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'worker') redirect('/dashboard')

  const params = await searchParams
  const fromExtension = params.from === 'extension' && params.title

  // When deep-linked from the extension, show a single pre-populated post
  // instead of the full feed so the worker can go straight to making an offer.
  const extensionPost = fromExtension ? {
    id: params.id ?? params.url ?? params.title!,
    title: params.title!,
    body: params.body ?? '',
    category: params.platform ?? 'From extension',
    platform: params.platform ?? null,
    neighborhood: params.location ?? '',
    postedAt: 'just now',
    reactions: 0,
    comments: 0,
    externalUrl: params.url ?? null,
  } : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          {extensionPost ? 'Make an offer' : 'Lead Feed'}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {extensionPost
            ? 'Post found by the Lead Finder extension.'
            : 'Local task requests from your neighbors — offer to help and route the job through TaskCoop.'}
        </p>
      </div>

      {!profile.stripe_onboarded && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-sm">
          <p className="font-semibold text-amber-900">Set up payouts first</p>
          <p className="text-amber-800 mt-1">
            You need a connected payout account before you can make offers.{' '}
            <a href="/api/stripe/connect" className="underline font-medium">Set up payouts →</a>
          </p>
        </div>
      )}

      {extensionPost ? (
        <PostCard post={extensionPost} profile={profile} />
      ) : (
        <>
          <HowItWorks profile={profile} />

          <div className="bg-stone-50 border border-stone-200 rounded-lg px-5 py-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">Find more leads automatically</p>
              <p className="text-sm text-stone-500 mt-0.5">
                The Lead Finder extension watches Nextdoor, Facebook, Craigslist, and Reddit as you browse and surfaces task posts in one click.
              </p>
            </div>
            <a
              href="/extension"
              className="shrink-0 text-sm bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors"
            >
              Get the extension
            </a>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">Nearby posts</h2>
            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
              Sample posts — live feed coming soon
            </span>
          </div>

          <div className="space-y-4">
            {MOCK_POSTS.map(post => (
              <PostCard key={post.id} post={post} profile={profile} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
