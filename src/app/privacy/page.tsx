import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — task.coop',
  description: 'Privacy Policy for task.coop.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-stone">
      <h1>Privacy Policy</h1>
      <p className="text-stone-500 text-sm">Last updated: June 2026</p>

      <p>
        This Privacy Policy describes how task.coop ("we," "us," or "our") collects, uses, and shares information
        about you when you use our platform at task.coop (the "Platform"). By using the Platform, you agree to the
        collection and use of information as described here.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Information you provide directly</h3>
      <ul>
        <li><strong>Account information:</strong> name, email address, and password when you register</li>
        <li><strong>Profile information:</strong> bio, profile photo, location (city/zip), and skills</li>
        <li><strong>Task information:</strong> task titles, descriptions, budgets, and service addresses you enter when posting tasks</li>
        <li><strong>Offer information:</strong> bids and amounts submitted by Members</li>
        <li><strong>Messages:</strong> communications sent through the Platform's messaging system</li>
        <li><strong>Identity documents:</strong> government-issued ID uploaded by Members for identity verification (stored securely and accessible only to platform administrators)</li>
        <li><strong>Reviews and ratings:</strong> feedback you leave for other users</li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> pages visited, features used, and interactions with the Platform</li>
        <li><strong>Device and browser information:</strong> IP address, browser type, and operating system</li>
        <li><strong>Authentication data:</strong> session tokens used to keep you logged in</li>
      </ul>

      <h3>Information from third parties</h3>
      <ul>
        <li><strong>Stripe:</strong> We receive confirmation of payment status and Connect account status from Stripe. We do not receive or store full payment card numbers. Stripe's privacy policy governs their handling of your financial data.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Create and manage your account</li>
        <li>Facilitate connections between Customers and Members</li>
        <li>Process payments and manage escrow through Stripe</li>
        <li>Enable messaging between users on a task</li>
        <li>Verify Member identity when requested</li>
        <li>Display your public profile and reviews to other users</li>
        <li>Send transactional emails (account creation, task updates, offers received)</li>
        <li>Investigate and resolve disputes between users</li>
        <li>Detect and prevent fraud, abuse, and policy violations</li>
        <li>Improve the Platform and understand how it is used</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>We do not sell your personal information. We share your information only in the following circumstances:</p>

      <h3>With other users</h3>
      <p>
        Your public profile, including your name, profile photo, bio, and reviews, is visible to all users of the
        Platform. When you post a task or submit an offer, the relevant details are visible to the other party in
        that transaction. Service addresses are shared only with Members whose offers have been accepted.
      </p>

      <h3>With service providers</h3>
      <ul>
        <li><strong>Stripe, Inc.:</strong> for payment processing and Connect onboarding. Stripe acts as an independent data controller for financial data.</li>
        <li><strong>Supabase:</strong> for database hosting and authentication infrastructure.</li>
        <li><strong>Vercel:</strong> for application hosting and delivery.</li>
      </ul>

      <h3>For legal reasons</h3>
      <p>
        We may disclose your information if required by law, subpoena, or other legal process, or if we believe in
        good faith that disclosure is necessary to protect the rights, property, or safety of task.coop, our users,
        or the public.
      </p>

      <h3>Business transfers</h3>
      <p>
        If task.coop is involved in a merger, acquisition, or sale of assets, your information may be transferred
        as part of that transaction. We will notify you before your information becomes subject to a materially
        different privacy policy.
      </p>

      <h2>4. Cookies and Local Storage</h2>
      <p>
        We use cookies and browser local storage solely for authentication, to keep you logged in across sessions.
        These are first-party cookies set by Supabase. We do not use third-party advertising or tracking cookies,
        and we do not share session data with advertisers.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your account information and activity data for as long as your account is active. If you request
        account deletion, we will delete or anonymize your personal information within 30 days, except where
        retention is required by law or necessary to resolve outstanding disputes or enforce our agreements.
        Transaction records may be retained for up to 7 years for tax and legal compliance purposes.
      </p>

      <h2>6. Security</h2>
      <p>
        We use industry-standard security measures to protect your information, including encrypted connections
        (HTTPS), hashed passwords, and restricted access controls. Identity documents are stored in a private,
        access-controlled storage bucket and are accessible only to authorized platform administrators. Payment
        data is handled entirely by Stripe's PCI-compliant infrastructure.
      </p>
      <p>
        No system is completely secure. We cannot guarantee that your information will never be accessed, disclosed,
        altered, or destroyed in a breach.
      </p>

      <h2>7. Your Rights and Choices</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> request a copy of the personal information we hold about you</li>
        <li><strong>Correction:</strong> update inaccurate information through your profile settings or by contacting us</li>
        <li><strong>Deletion:</strong> request deletion of your account and associated personal information</li>
        <li><strong>Portability:</strong> request an export of your data in a machine-readable format</li>
      </ul>
      <p>
        To exercise any of these rights, email us at{' '}
        <a href="mailto:privacy@taskcoop.org">privacy@taskcoop.org</a>. We will respond within 30 days.
      </p>

      <h2>8. Lead Finder Browser Extension</h2>
      <p>
        The TaskCoop Lead Finder is a browser extension available for Chrome and Firefox. Its data practices differ
        from the Platform and are described here separately.
      </p>
      <ul>
        <li><strong>What it reads:</strong> The extension reads the visible text of posts on Nextdoor, Facebook Groups, Craigslist, and Reddit as you browse those sites normally. It scores each post against a list of task-related keywords to determine relevance.</li>
        <li><strong>What it stores:</strong> Matching posts are stored in your browser's local extension storage (<code>chrome.storage.local</code>). This data never leaves your device.</li>
        <li><strong>What it transmits:</strong> The extension transmits nothing to task.coop servers. If you click "Offer to help," your browser navigates to task.coop with the post title, body, and source URL as URL parameters. No data is sent silently or in the background.</li>
        <li><strong>Credentials:</strong> The extension does not access, read, or transmit your Nextdoor, Facebook, Craigslist, or Reddit credentials or session data.</li>
        <li><strong>Browsing history:</strong> The extension does not collect or transmit your browsing history.</li>
      </ul>

      <h2>9. Children's Privacy</h2>
      <p>
        task.coop is intended for users who are 18 years of age or older. We do not knowingly collect personal
        information from anyone under 18. If we learn that we have collected information from a minor, we will
        delete it promptly.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes by posting the
        updated policy on this page with a new "Last updated" date. Your continued use of the Platform after changes
        are posted constitutes your acceptance of the revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or requests: <a href="mailto:privacy@taskcoop.org">privacy@taskcoop.org</a>
      </p>
    </div>
  )
}
