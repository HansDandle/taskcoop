import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'task.coop — Worker-Owned Local Services in Austin, TX', template: '%s | task.coop' },
  description: 'Find trusted local help for handyman, cleaning, moving, and more. task.coop is a worker-owned marketplace with transparent 5% fees. Built for Austin, TX.',
  keywords: ['Austin services', 'local handyman', 'worker-owned', 'cooperative marketplace', 'cleaning', 'moving help'],
  openGraph: {
    siteName: 'task.coop',
    locale: 'en_US',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let profile = null
  if (authUser) {
    const { data } = await supabase.from('users').select('id, name, role').eq('id', authUser.id).single()
    profile = data ? { ...data, email: authUser.email } : null
  }

  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <Nav user={profile} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
