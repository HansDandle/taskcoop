import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Member Ownership — The Co-op Model',
  description: 'task.coop is built as a member-owned cooperative. Learn about our model, our values, and the roadmap to full democratic ownership.',
}

export default function CooperativePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
        Cooperative model
      </div>
      <h1 className="text-3xl font-bold text-stone-900 mb-4">Members own this platform.</h1>
      <p className="text-lg text-stone-500 mb-12 leading-relaxed">
        Most gig platforms extract value from the people doing the work. task.coop is built to do the opposite: distribute it.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Why a cooperative?</h2>
          <div className="text-stone-600 space-y-4 leading-relaxed">
            <p>Platforms like TaskRabbit and Thumbtack take 15–30% of every job. They set the rules, raise fees whenever they want, and the people doing the work have no say.</p>
            <p>task.coop is structured as a member-owned cooperative. That means the members, the people doing the actual work, have a stake in the platform and, eventually, a vote in how it's run.</p>
            <p>We charge 5% because we don't need to extract profit for outside investors. We need enough to run the platform and grow it sustainably.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-6">What membership means today</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Low fees', body: '5% platform fee. Members keep 95% of every job.' },
              { title: 'Direct messaging', body: 'Talk to customers directly, without algorithmic gatekeeping.' },
              { title: 'Transparent policies', body: 'All platform rules are published. No surprise deactivations.' },
              { title: 'Human dispute resolution', body: 'Real human review for disputes, not automated bans.' },
            ].map((item) => (
              <div key={item.title} className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <div className="font-semibold text-stone-900 mb-1">{item.title}</div>
                <div className="text-sm text-stone-500">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-4">The roadmap to full ownership</h2>
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            We&apos;re building this in phases. The cooperative governance tools don&apos;t exist yet, but they&apos;re on the roadmap, not vaporware.
          </p>
          <div className="space-y-4">
            {[
              { phase: 'Now', label: 'MVP launch', desc: 'Platform launches, first transactions, cooperative narrative established. 5% fee locked in.' },
              { phase: 'Q3 2026', label: 'Member equity', desc: 'Active members earn equity units based on platform activity. Equity tracked transparently.' },
              { phase: 'Q1 2027', label: 'Democratic governance', desc: 'Members vote on platform policies, fee structure, and major decisions through an in-platform governance system.' },
              { phase: '2027+', label: 'Profit sharing', desc: 'Platform surplus distributed to members proportional to their contribution.' },
            ].map((item) => (
              <div key={item.phase} className="flex gap-4">
                <div className="text-xs font-mono text-emerald-600 w-20 shrink-0 pt-0.5">{item.phase}</div>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{item.label}</div>
                  <div className="text-stone-500 text-sm leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-6 italic">
            Roadmap dates are targets, not guarantees. Governance structure subject to legal review and member input.
          </p>
        </section>

        <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Join us early</h2>
          <p className="text-stone-600 text-sm mb-4 leading-relaxed">
            Early members will have the most influence over how this platform evolves. If you work in Austin and want to build something real, this is your chance.
          </p>
          <Link href="/signup?role=worker" className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Apply to become a member
          </Link>
        </section>
      </div>
    </div>
  )
}
