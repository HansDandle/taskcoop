import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
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
    </div>
  )
}
