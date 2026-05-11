import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member Classification — task.coop',
  description: 'task.coop member classification policy — independent contractors, not employees.',
}

export default function WorkerClassificationPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-stone">
      <h1>Member Classification</h1>
      <p className="text-stone-500 text-sm">Last updated: May 2026</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 not-prose mb-8">
        <p className="text-sm text-amber-800">This page is for informational purposes only and is not legal advice. Consult an attorney for advice specific to your situation.</p>
      </div>

      <h2>Independent Contractor Status</h2>
      <p>Members who use task.coop to offer services are independent contractors, not employees of task.coop. This means:</p>
      <ul>
        <li>Members set their own rates and schedules</li>
        <li>Members may work for multiple platforms or clients simultaneously</li>
        <li>task.coop does not withhold taxes from payments</li>
        <li>Members are responsible for their own taxes, including self-employment tax</li>
        <li>Members are not entitled to employee benefits such as health insurance, paid leave, or workers' compensation</li>
      </ul>

      <h2>Tax Obligations</h2>
      <p>
        Members earning $600 or more in a calendar year through task.coop may receive a 1099-K form from Stripe.
        Members are responsible for reporting all income and paying applicable federal, state, and local taxes,
        including self-employment tax. We recommend consulting a tax professional familiar with independent
        contractor income.
      </p>

      <h2>Licensing and Insurance</h2>
      <p>
        task.coop does not verify professional licenses or certifications, and does not provide workers'
        compensation, general liability insurance, or any other insurance to members or customers. Members are
        responsible for complying with all applicable licensing requirements in their jurisdiction and are
        encouraged to obtain appropriate business insurance. Customers are encouraged to ask members about
        their qualifications and insurance coverage before hiring.
      </p>

      <h2>The Cooperative Model and Employment</h2>
      <p>
        task.coop is working toward a cooperative structure where active members become stakeholders in the
        platform. Member-ownership, including any future equity, profit-sharing, or governance rights, does
        not create or imply an employment relationship. These are two distinct legal concepts.
      </p>

      <h2>Questions</h2>
      <p>Questions about member classification? Email <a href="mailto:hello@taskcoop.org">hello@taskcoop.org</a>.</p>
    </div>
  )
}
