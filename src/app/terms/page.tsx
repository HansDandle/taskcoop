import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for task.coop.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-stone">
      <h1>Terms of Service</h1>
      <p className="text-stone-500 text-sm">Last updated: May 2026</p>

      <h2>1. Agreement</h2>
      <p>By using task.coop, you agree to these Terms. If you don't agree, don't use the platform.</p>

      <h2>2. The Platform</h2>
      <p>task.coop is a marketplace that connects customers seeking local services with independent workers ("members"). We are not a party to any transaction between customers and workers.</p>

      <h2>3. Your Account</h2>
      <p>You must provide accurate information when creating an account. You are responsible for all activity under your account.</p>

      <h2>4. Fees</h2>
      <p>task.coop charges a 5% platform fee on completed transactions. This fee is deducted automatically from payments. Customers pay the agreed price; workers receive the agreed price minus 5%.</p>

      <h2>5. Payments</h2>
      <p>Payments are processed by Stripe. Funds are held in escrow until a task is marked complete by the customer. task.coop may refund payments at its discretion in cases of dispute.</p>

      <h2>6. Prohibited Conduct</h2>
      <p>You may not use task.coop to: conduct transactions outside the platform; post fraudulent listings; harass or threaten other users; violate any applicable law.</p>

      <h2>7. Termination</h2>
      <p>We may suspend or terminate accounts that violate these Terms.</p>

      <h2>8. Disclaimer</h2>
      <p>task.coop is provided "as is." We don't guarantee that any particular task will be completed or that workers are licensed or insured.</p>

      <h2>9. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, task.coop is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>

      <h2>10. Governing Law</h2>
      <p>These Terms are governed by the laws of the State of Texas.</p>

      <h2>Contact</h2>
      <p>Questions? Email <a href="mailto:hello@task.coop">hello@task.coop</a>.</p>
    </div>
  )
}
