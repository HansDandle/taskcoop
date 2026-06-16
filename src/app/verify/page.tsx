import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import IdVerification from '@/components/id-verification'

export const metadata: Metadata = { title: 'Verify your identity' }

export default async function VerifyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/verify')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  // Verification is for members (workers). Customers don't need it.
  if (profile?.role !== 'worker') redirect('/dashboard')

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700">← Dashboard</Link>
      <h1 className="text-2xl font-bold text-stone-900 mt-3 mb-1">Verify your identity</h1>
      <p className="text-stone-600 text-sm mb-6 leading-relaxed">
        Verified members get a badge customers trust, which wins more jobs. Your ID and selfie are private:
        only admins can view them, and they&apos;re never shown publicly. It takes about three minutes.
      </p>
      <IdVerification profile={profile} />
    </div>
  )
}
