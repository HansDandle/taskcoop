import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how task.coop connects customers with local member-workers in Austin, TX. Transparent 5% fee, secure payments, worker-owned.',
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-stone-900 mb-4">How task.coop works</h1>
      <p className="text-stone-500 mb-12 text-lg">Simple, transparent, and built for Austin.</p>

      <div className="space-y-14">
        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-6">For customers</h2>
          <div className="space-y-6">
            {[
              { n: '1', title: 'Create a free account', body: 'Sign up with your email. No subscription. No upfront cost.' },
              { n: '2', title: 'Post your task', body: 'Describe what you need: handyman, cleaning, moving help, yard work, furniture assembly, or junk removal. Set a budget, upload photos, and pick your preferred date.' },
              { n: '3', title: 'Receive offers', body: 'Local member-workers submit offers with their price and a note. You can message them directly before deciding.' },
              { n: '4', title: 'Accept and pay', body: "Accept the offer you like. Your payment is held securely until the job is complete; you're protected." },
              { n: '5', title: 'Job done, funds released', body: 'When you mark the task complete, the worker gets paid (minus the 5% platform fee). Then leave a review.' },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">{s.n}</div>
                <div>
                  <div className="font-semibold text-stone-900">{s.title}</div>
                  <div className="text-stone-500 text-sm mt-1 leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-6">For workers / members</h2>
          <div className="space-y-6">
            {[
              { n: '1', title: 'Apply to become a member', body: 'Sign up as a worker-member. Set up your profile with your skills, bio, and service area.' },
              { n: '2', title: 'Browse open tasks', body: 'See tasks posted by customers near you. Filter by category, budget, or distance.' },
              { n: '3', title: 'Submit an offer', body: 'Send the customer your price and a short message. No bidding wars, just honest offers.' },
              { n: '4', title: 'Do the work', body: 'Show up, do great work, and mark the task complete when done.' },
              { n: '5', title: 'Get paid', body: 'Funds are released to your connected Stripe account within 1–2 business days. You keep 95%.' },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold text-sm flex items-center justify-center shrink-0">{s.n}</div>
                <div>
                  <div className="font-semibold text-stone-900">{s.title}</div>
                  <div className="text-stone-500 text-sm mt-1 leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-stone-50 border border-stone-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Simple, transparent fees</h2>
          <div className="text-stone-600 text-sm space-y-2">
            <p>task.coop charges a <strong>5% platform fee</strong> on completed transactions. That's it.</p>
            <p>There are no listing fees, no subscription fees, no surprise charges.</p>
            <p>Compare that to platforms that take 20–30%. The difference stays with the worker.</p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tasks/new" className="bg-emerald-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-emerald-700 transition-colors">
              Post a Task
            </Link>
            <Link href="/signup?role=worker" className="bg-white border border-stone-300 text-stone-700 px-8 py-3 rounded-md font-semibold hover:border-stone-500 transition-colors">
              Become a Member
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
