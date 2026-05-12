import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import PWAInstaller from '@/components/pwa-installer'
import { createClient } from '@/lib/supabase/server'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'task.coop — Worker-Owned Local Services in Austin, TX', template: '%s | task.coop' },
  description: 'Find trusted local help for handyman, cleaning, moving, and more. task.coop is a worker-owned marketplace with transparent 5% fees. Built for Austin, TX.',
  keywords: ['Austin services', 'local handyman', 'worker-owned', 'cooperative marketplace', 'cleaning', 'moving help'],
  applicationName: 'task.coop',
  appleWebApp: {
    capable: true,
    title: 'task.coop',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    siteName: 'task.coop',
    locale: 'en_US',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let profile = null
  let dashboardAlert = false
  if (authUser) {
    const { data } = await supabase.from('users').select('id, name, role').eq('id', authUser.id).single()
    profile = data ? { ...data, email: authUser.email } : null

    if (profile?.role === 'customer') {
      // Pending offers on own open tasks, or jobs marked done awaiting review
      const { data: ownTasks } = await supabase
        .from('tasks')
        .select('id, status, worker_marked_done')
        .eq('customer_id', authUser.id)
      const openIds = (ownTasks ?? []).filter(t => t.status === 'open').map(t => t.id)
      const hasPendingReview = (ownTasks ?? []).some(t => t.worker_marked_done && t.status !== 'completed')
      const hasNeedsReview = (ownTasks ?? []).some(t => t.status === 'completed')
      let hasPendingOffer = false
      if (openIds.length > 0) {
        const { count } = await supabase
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .in('task_id', openIds)
          .eq('status', 'pending')
        hasPendingOffer = (count ?? 0) > 0
      }
      dashboardAlert = hasPendingOffer || hasPendingReview || hasNeedsReview
    } else if (profile?.role === 'worker') {
      // Accepted offers or completed jobs awaiting review
      const { data: workerOffers } = await supabase
        .from('offers')
        .select('status, tasks(status)')
        .eq('worker_id', authUser.id)
        .eq('status', 'accepted')
      dashboardAlert = (workerOffers ?? []).some(o => (o.tasks as any)?.status === 'completed')
    }
  }

  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <Nav user={profile} dashboardAlert={dashboardAlert} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <PWAInstaller />
      </body>
    </html>
  )
}
