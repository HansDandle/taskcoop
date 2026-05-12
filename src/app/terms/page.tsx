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
        ("Terms"). If you do not agree, you may not use the Platform. We may update these Terms from time to time.
        For material changes, we will provide notice by email to the address registered on your account or by
        posting a prominent notice on the Platform at least 30 days before the changes take effect. Non-material
        changes (such as typos, clarifications, or updates to contact information) take effect upon posting.
        Continued use after the effective date constitutes acceptance of the revised Terms.
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
        <a href="mailto:hello@taskcoop.org">hello@taskcoop.org</a> if you suspect unauthorized access to your account.
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

      <h2>11. Anti-Discrimination</h2>
      <p>
        task.coop is committed to a community free from discrimination. You may not refuse to provide or receive
        services, or otherwise treat any user differently, on the basis of race, color, national origin, ancestry,
        immigration status, religion, sex, gender identity, sexual orientation, marital or family status, age,
        disability, medical condition, military or veteran status, or any other characteristic protected under
        applicable federal, state, or local law. Violation of this policy is grounds for immediate account
        termination. task.coop reserves sole discretion to determine whether conduct constitutes discrimination
        under this Section.
      </p>

      <h2>12. Off-Platform Transactions</h2>
      <p>
        Arranging or completing transactions outside of task.coop, including accepting cash or other payment
        directly from a Customer you met through the Platform, is a violation of these Terms and may result in
        immediate account termination. Off-platform transactions are not covered by any escrow protection or dispute
        process.
      </p>

      <h2>13. Intoxication and Safety</h2>
      <p>
        You must not use the Platform or perform services while under the influence of alcohol, illegal drugs, or
        any substance that impairs your judgment or ability to safely perform or receive services. Members are
        responsible for providing a safe environment for themselves while performing services and for declining any
        job they believe poses an unreasonable risk. Customers are responsible for providing a reasonably safe
        environment within their home or property. If task.coop has reason to believe you have violated this
        Section, we may suspend or terminate your account at our sole discretion.
      </p>

      <h2>14. Content</h2>
      <p>
        You are solely responsible for any content you post on the Platform (task descriptions, messages, profile
        information, photos, etc.). By posting content, you grant task.coop a non-exclusive, royalty-free license
        to display and distribute that content in connection with operating the Platform. You represent that you
        have all rights necessary to grant this license. task.coop reserves the right to remove content that
        violates these Terms or that we deem inappropriate.
      </p>

      <h2>15. Assumption of Risk</h2>
      <p>
        task.coop is a marketplace that connects Customers and Members. Services are performed in person, often
        inside private homes or on private property. You acknowledge and agree that:
      </p>
      <ul>
        <li>task.coop does not perform background checks beyond optional ID verification, does not verify professional qualifications, and does not supervise the services performed through the Platform;</li>
        <li>In-person service involves inherent risks, including bodily injury, property damage, theft, and exposure to illness;</li>
        <li>You assume all risks associated with meeting, hosting, or working with other users of the Platform, whether online or offline;</li>
        <li>You are responsible for taking reasonable precautions, including verifying identity, supervising work performed on your property, and securing valuables;</li>
        <li>Members are responsible for maintaining appropriate liability, automobile, and other insurance for the services they offer.</li>
      </ul>

      <h2>16. Disclaimer of Warranties</h2>
      <p>
        THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. task.coop EXPRESSLY
        DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED,
        ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
      </p>

      <h2>17. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, task.coop AND ITS OFFICERS, DIRECTORS, AND AGENTS WILL
        NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
        PROFITS OR REVENUES, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE
        POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE
        OF THE PLATFORM WILL NOT EXCEED THE GREATER OF $100 OR THE AMOUNT OF FEES PAID BY YOU TO task.coop IN THE
        THREE MONTHS PRECEDING THE CLAIM.
      </p>

      <h2>18. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless task.coop and its officers, directors, and agents from any claims,
        damages, losses, or expenses (including reasonable attorneys' fees) arising out of your use of the Platform,
        your violation of these Terms, or your violation of any third-party rights.
      </p>

      <h2>19. Electronic Communications</h2>
      <p>
        By creating an account, you consent to receive communications from task.coop in electronic form, including
        account notices, transaction confirmations, dispute correspondence, legal disclosures, and updates to these
        Terms. We may communicate by email to the address on your account, SMS to the phone number on your account,
        or in-app notification. You agree that electronic communications satisfy any legal requirement that such
        communications be in writing. You may withdraw consent for marketing communications at any time, but consent
        to transactional communications is required to use the Platform.
      </p>

      <h2>20. Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Texas, without regard to its conflict of law principles.
        Any dispute arising from these Terms or your use of the Platform will be resolved exclusively in the state
        or federal courts located in Travis County, Texas, and you consent to personal jurisdiction in those courts.
      </p>

      <h2>21. Assignment</h2>
      <p>
        You may not assign or transfer these Terms or any of your rights or obligations under them without our prior
        written consent. We may assign these Terms, in whole or in part, to any successor, affiliate, or acquirer of
        our business or assets without notice or consent. Any assignment in violation of this Section is void.
      </p>

      <h2>22. Severability</h2>
      <p>
        If any provision of these Terms is held invalid or unenforceable by a court of competent jurisdiction, that
        provision will be enforced to the maximum extent permissible and the remaining provisions will remain in
        full force and effect.
      </p>

      <h2>23. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy, constitute the entire agreement between you and task.coop
        regarding your use of the Platform and supersede any prior agreements.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <a href="mailto:hello@taskcoop.org">hello@taskcoop.org</a>.
      </p>
    </div>
  )
}
