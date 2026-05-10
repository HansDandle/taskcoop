import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about task.coop — fees, payments, how to post tasks, and membership.',
}

const faqs = [
  {
    q: 'How much does task.coop charge?',
    a: 'We charge a flat 5% platform fee on completed transactions. Customers pay the agreed price. Members receive the agreed price minus 5%. There are no other fees.',
  },
  {
    q: 'Is it free to post a task?',
    a: 'Yes. Posting a task is completely free. You only pay when you accept an offer and the job is completed.',
  },
  {
    q: 'How do I become a member?',
    a: 'Sign up, select "Work & Earn" during registration, complete your profile with your skills and service area, and connect your bank account via Stripe. You can start browsing and bidding on tasks immediately.',
  },
  {
    q: 'Is my payment protected?',
    a: "Yes. When you accept an offer, your payment is held in escrow by Stripe. Funds are only released to the member when you mark the task as complete. If there's a dispute, our team reviews it and works with you to make it right.",
  },
  {
    q: 'What areas does task.coop serve?',
    a: "We're launching in Austin, TX. If you're outside Austin and interested, sign up — we're planning to expand to other cities.",
  },
  {
    q: 'What kinds of tasks can I post?',
    a: 'We currently support: Handyman, Furniture Assembly, Junk Removal, Moving Help, Yard Work, and Cleaning. More categories coming as we grow.',
  },
  {
    q: 'Can I message a member before accepting their offer?',
    a: 'Yes. You can message any member who has submitted an offer on your task, directly through the platform.',
  },
  {
    q: "What if a member doesn't show up or the work is unsatisfactory?",
    a: "Contact us through the dispute process on your task page. We review each case individually — members are encouraged to document their work with photos and notes. We'll work with you to make it right, whether that's a refund or a credit.",
  },
  {
    q: 'Are members employees of task.coop?',
    a: 'No. Members are independent contractors who use the platform to find work. See our Member Classification page for details. The cooperative structure means members have a stake in the platform — but that is distinct from employment.',
  },
  {
    q: 'How does member ownership work?',
    a: "task.coop is structured as a member-owned cooperative. We're in early stages — full governance tools are on the roadmap for 2027. Right now, membership means low fees, transparent policies, and early access to shape how the platform evolves. See the Co-op page for details.",
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-stone-900 mb-3">Frequently asked questions</h1>
      <p className="text-stone-500 mb-12">Can&apos;t find what you&apos;re looking for? <Link href="mailto:hello@task.coop" className="text-emerald-600 hover:underline">Email us</Link>.</p>

      <div className="divide-y divide-stone-200">
        {faqs.map((faq) => (
          <details key={faq.q} className="group py-5">
            <summary className="flex cursor-pointer items-start justify-between font-semibold text-stone-900 gap-4 list-none">
              <span>{faq.q}</span>
              <span className="text-stone-400 group-open:rotate-180 transition-transform mt-0.5">▼</span>
            </summary>
            <p className="mt-4 text-stone-500 leading-relaxed text-sm">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
