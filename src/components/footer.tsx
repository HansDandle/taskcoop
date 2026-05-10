import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-semibold text-stone-900 mb-3">task<span className="text-emerald-600">.coop</span></div>
            <p className="text-stone-500 leading-relaxed">Member-owned local services marketplace. Built for Austin, TX.</p>
          </div>
          <div>
            <div className="font-medium text-stone-700 mb-3">Platform</div>
            <ul className="space-y-2 text-stone-500">
              <li><Link href="/tasks" className="hover:text-stone-900">Browse Tasks</Link></li>
              <li><Link href="/tasks/new" className="hover:text-stone-900">Post a Task</Link></li>
              <li><Link href="/signup?role=worker" className="hover:text-stone-900">Become a Member</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-stone-700 mb-3">Learn</div>
            <ul className="space-y-2 text-stone-500">
              <li><Link href="/how-it-works" className="hover:text-stone-900">How It Works</Link></li>
              <li><Link href="/cooperative" className="hover:text-stone-900">Member Ownership</Link></li>
              <li><Link href="/faq" className="hover:text-stone-900">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-stone-700 mb-3">Legal</div>
            <ul className="space-y-2 text-stone-500">
              <li><Link href="/terms" className="hover:text-stone-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-stone-900">Privacy Policy</Link></li>
              <li><Link href="/worker-classification" className="hover:text-stone-900">Member Classification</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between text-xs text-stone-400">
          <span>© {new Date().getFullYear()} task.coop. All rights reserved.</span>
          <span className="mt-1 sm:mt-0">Platform fee: 5% — transparent, always.</span>
        </div>
      </div>
    </footer>
  )
}
