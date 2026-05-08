import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Worker Classification',
  description: 'task.coop worker classification policy — independent contractors, not employees.',
}

export default function WorkerClassificationPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-stone">
      <h1>Worker Classification</h1>
      <p className="text-stone-500 text-sm">Last updated: May 2026</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 not-prose mb-8">
        <p className="text-sm text-amber-800">This page is for informational purposes only and is not legal advice. Consult an attorney for advice specific to your situation.</p>
      </div>

      <h2>Independent Contractor Status</h2>
      <p>Workers who use task.coop are independent contractors, not employees of task.coop. This means:</p>
      <ul>
        <li>Workers set their own rates and schedules</li>
        <li>Workers may work for multiple platforms or clients</li>
        <li>task.coop does not withhold taxes from payments</li>
        <li>Workers are responsible for their own taxes, including self-employment tax</li>
        <li>Workers are not entitled to employee benefits</li>
      </ul>

      <h2>Tax Obligations</h2>
      <p>Workers earning $600 or more in a calendar year through task.coop may receive a 1099-K form from Stripe. Workers are responsible for reporting all income and paying applicable federal, state, and local taxes.</p>

      <h2>Insurance</h2>
      <p>task.coop does not provide workers' compensation, liability insurance, or other insurance to workers or customers. Workers are encouraged to obtain appropriate business insurance. Customers are encouraged to verify insurance status for high-risk tasks.</p>

      <h2>The Cooperative Model</h2>
      <p>task.coop is working toward a cooperative structure where active members become owners. This is distinct from employment status. Member-ownership does not create an employment relationship.</p>

      <h2>Questions</h2>
      <p>Questions about worker classification? Email <a href="mailto:hello@task.coop">hello@task.coop</a>.</p>
    </div>
  )
}
