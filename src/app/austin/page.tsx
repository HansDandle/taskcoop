import type { Metadata } from 'next'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Local Services in Austin, TX — task.coop',
  description: 'Find local handyman, cleaning, moving help, yard work, and more in Austin, TX. Worker-owned marketplace with 5% transparent fee.',
  openGraph: {
    title: 'Local Services in Austin, TX — task.coop',
    description: 'Find local handyman, cleaning, moving help, yard work, and more in Austin, TX. Worker-owned, 5% fee.',
    url: 'https://task.coop/austin',
    type: 'website',
  },
  alternates: { canonical: 'https://task.coop/austin' },
}

export default function AustinPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-stone-900 mb-3">Local services in Austin, TX</h1>
      <p className="text-stone-500 mb-10 text-lg">task.coop is built for Austin. Find trusted local workers for any job.</p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/services/${cat.slug}`} className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg p-4 hover:border-emerald-400 hover:shadow-sm transition-all">
            <span className="text-2xl">{cat.icon}</span>
            <div>
              <div className="font-semibold text-stone-900 text-sm">{cat.name}</div>
              <div className="text-xs text-stone-400">Austin, TX</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
        <h2 className="font-semibold text-stone-900 mb-2">Why task.coop for Austin?</h2>
        <ul className="text-sm text-stone-600 space-y-2">
          <li>✓ Local workers who know Austin</li>
          <li>✓ 5% platform fee; workers keep 95%</li>
          <li>✓ Worker-owned cooperative, built to last</li>
          <li>✓ Secure payments with Stripe</li>
        </ul>
        <div className="mt-5 flex gap-3">
          <Link href="/tasks/new" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Post a Task
          </Link>
          <Link href="/signup?role=worker" className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-md text-sm font-semibold hover:border-stone-500 transition-colors">
            Join as a Worker
          </Link>
        </div>
      </div>
    </div>
  )
}
