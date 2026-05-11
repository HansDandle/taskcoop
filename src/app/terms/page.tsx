import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — task.coop',
  description: 'Terms of Service for task.coop.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-stone">
      <h1>Terms of Service</h1>
      <p className="text-stone-500 text-sm">Last updated: May 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using task.coop (the "Platform"), you agree to be bound by these Terms of Service
        ("Terms"). If you do not agree, you may not use the Platform. We may update these Terms from time to time;
        continued use after changes are posted constitutes acceptance of the revised Terms.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old to use task.coop. By using the Platform you represent that you meet this
        requirement and that the information you provide is accurate and complete.
      </p>

      <h2>3. Description of the Platform</h2>
      <p>
        task.coop is an online marketplace that connects customers seeking local services ("Customers") with
        independent service providers ("Members"). task.coop is not a party to any agreement between Customers and
        Members, does not employ Members, and does not perform or guarantee the performance of any services.
      </p>

      <h2>4. Independent Contractor Relationship</h2>
      <p>
        Members on task.coop are independent contractors, not employees, agents, or partners of task.coop. Members
        are solely responsible for determining how, when, and where they perform services; setting their own rates;
        complying with all applicable laws and regulations (including licensing, permits, and tax obligations); and
        obtaining any required insurance. task.coop does not withhold taxes on behalf of Members. Members should
        consult a tax professional regarding their obligations as independent contractors.
      </p>

      <h2>5. No Guarantee of Licensing or Insurance</h2>
      <p>
        task.coop does not verify that Members hold any professional license, certification, or insurance coverage.
        Customers are encouraged to ask Members directly about their qualifications, experience, and insurance before
        hiring. task.coop expressly disclaims any responsibility for the professional qualifications or insurance
        status of Members.
      </p>

      <h2>6. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activity
        that occurs under your account. You must notify us immediately at{' '}
        <a href="mailto:hello@task.coop">hello@task.coop</a> if you suspect unauthorized access to your account.
        task.coop reserves the right to suspend or terminate accounts that violate these Terms or that we determine,
        in our sole discretion, pose a risk to other users or the Platform.
      </p>

      <h2>7. Fees</h2>
      <p>
        task.coop charges a 5% platform fee on completed transactions. This fee is deducted automatically from the
        payment before it is released to the Member. The Customer pays the full agreed price; the Member receives
        that amount minus the 5% platform fee. Fees are non-refundable except as expressly stated in these Terms or
        required by law.
      </p>

      <h2>8. Payments and Escrow</h2>
      <p>
        Payments are processed by Stripe, Inc. When a Customer accepts an offer, payment is collected and held in
        escrow. Funds are released to the Member when the Customer marks the task complete. If a Customer does not
        mark a task complete within a reasonable period following reported completion, task.coop may release funds
        at its discretion.
      </p>
      <p>
        By using the Platform, you authorize task.coop and Stripe to collect, hold, and transfer funds in accordance
        with these Terms and Stripe's own terms of service. task.coop does not store full payment card numbers.
      </p>

      <h2>9. Disputes Between Users</h2>
      <p>
        task.coop encourages all users to document their work thoroughly, including photos, written agreements, and
        records of communications, before, during, and after each task. In the event of a dispute, task.coop will
        review the matter on a case-by-case basis and may, at its sole discretion, issue a refund, account credit,
        or other remedy to the Customer. task.coop's decision in any dispute is final.
      </p>
      <p>
        task.coop is not obligated to mediate disputes and is not liable for any loss resulting from a dispute
        between a Customer and a Member.
      </p>

      <h2>10. Prohibited Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Circumvent the Platform by arranging payment for services outside of task.coop ("off-platform transactions")</li>
        <li>Post false, misleading, or fraudulent listings or offers</li>
        <li>Harass, threaten, or discriminate against other users</li>
        <li>Use the Platform for any unlawful purpose</li>
        <li>Attempt to reverse-engineer, scrape, or interfere with the Platform's infrastructure</li>
        <li>Create multiple accounts to circumvent a suspension</li>
      </ul>

      <h2>11. Off-Platform Transactions</h2>
      <p>
        Arranging or completing transactions outside of task.coop, including accepting cash or other payment
        directly from a Customer you met through the Platform, is a violation of these Terms and may result in
        immediate account termination. Off-platform transactions are not covered by any escrow protection or dispute
        process.
      </p>

      <h2>12. Content</h2>
      <p>
        You are solely responsible for any content you post on the Platform (task descriptions, messages, profile
        information, photos, etc.). By posting content, you grant task.coop a non-exclusive, royalty-free license
        to display and distribute that content in connection with operating the Platform. You represent that you
        have all rights necessary to grant this license. task.coop reserves the right to remove content that
        violates these Terms or that we deem inappropriate.
      </p>

      <h2>13. Disclaimer of Warranties</h2>
      <p>
        THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. task.coop EXPRESSLY
        DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED,
        ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
      </p>

      <h2>14. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, task.coop AND ITS OFFICERS, DIRECTORS, AND AGENTS WILL
        NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
        PROFITS OR REVENUES, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE
        POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE
        OF THE PLATFORM WILL NOT EXCEED THE GREATER OF $100 OR THE AMOUNT OF FEES PAID BY YOU TO task.coop IN THE
        THREE MONTHS PRECEDING THE CLAIM.
      </p>

      <h2>15. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless task.coop and its officers, directors, and agents from any claims,
        damages, losses, or expenses (including reasonable attorneys' fees) arising out of your use of the Platform,
        your violation of these Terms, or your violation of any third-party rights.
      </p>

      <h2>16. Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Texas, without regard to its conflict of law principles.
        Any dispute arising from these Terms or your use of the Platform will be resolved exclusively in the state
        or federal courts located in Travis County, Texas, and you consent to personal jurisdiction in those courts.
      </p>

      <h2>17. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy, constitute the entire agreement between you and task.coop
        regarding your use of the Platform and supersede any prior agreements.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <a href="mailto:hello@task.coop">hello@task.coop</a>.
      </p>
    </div>
  )
}
