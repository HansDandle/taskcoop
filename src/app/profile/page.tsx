import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileForm from './profile-form'
import AddressManager from './address-manager'

export const metadata: Metadata = { title: 'Edit Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  const { data: addresses } = profile?.role === 'customer'
    ? await supabase.from('customer_addresses').select('*').eq('user_id', user.id).order('created_at')
    : { data: [] }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Edit profile</h1>
        <p className="text-stone-500 text-sm mb-8">Update your public information.</p>
        <ProfileForm profile={profile} email={user.email ?? ''} />
      </div>

      {profile?.role === 'customer' && (
        <div className="border-t border-stone-200 pt-10">
          <AddressManager addresses={addresses ?? []} />
        </div>
      )}

      <div className="border-t border-stone-200 pt-10">
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Notifications</h2>
        <p className="text-stone-500 text-sm mb-4">Control which emails and push notifications you receive.</p>
        <Link
          href="/profile/notifications"
          className="inline-block text-sm border border-stone-300 text-stone-700 px-4 py-2 rounded-md font-medium hover:border-stone-500 transition-colors"
        >
          Manage notification preferences →
        </Link>
      </div>
    </div>
  )
}
