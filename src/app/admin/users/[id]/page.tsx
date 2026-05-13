import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency, formatRelativeDate } from '@/lib/utils'
import AdminUserActions from '../admin-user-actions'
import AdminUserNotes from './admin-user-notes'
import AdminLicenseReview from './admin-license-review'

export const metadata: Metadata = { title: 'Admin — User Detail' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase.rpc('get_my_role')
  if (roleData !== 'admin') redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [
    { data: tasks },
    { data: offers },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, status, budget, created_at, payment_status')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('offers')
      .select('id, amount, status, created_at, tasks(id, title)')
      .eq('worker_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users!reviewer_id(name)')
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const completedTasks = tasks?.filter(t => t.status === 'completed') ?? []
  const totalEarned = offers
    ?.filter(o => o.status === 'accepted')
    .reduce((sum, o) => sum + o.amount, 0) ?? 0
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/users" className="text-sm text-stone-500 hover:text-stone-700">← Users</Link>
        <span className="text-stone-300" aria-hidden="true">/</span>
        <h1 className="text-xl font-bold text-stone-900">{profile.name}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          profile.role === 'worker' ? 'bg-blue-50 text-blue-700' :
          profile.role === 'admin' ? 'bg-purple-50 text-purple-700' :
          'bg-stone-100 text-stone-600'
        }`}>{profile.role === 'worker' ? 'member' : profile.role}</span>
        {profile.id_verified && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ ID Verified</span>}
        {profile.suspended && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Suspended</span>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column — profile + actions */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-14 h-14 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-lg font-bold text-stone-600">
                  {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-stone-900">{profile.name}</div>
                <div className="text-xs text-stone-500">Joined {formatDate(profile.created_at)}</div>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Stripe onboarded</dt>
                <dd className="font-medium">{profile.stripe_onboarded ? '✓ Yes' : 'No'}</dd>
              </div>
              {profile.stripe_account_id && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">Stripe account</dt>
                  <dd className="font-mono text-xs text-stone-600">{profile.stripe_account_id}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone-500">ID verification</dt>
                <dd className="font-medium">{
                  profile.id_verified ? '✓ Verified' :
                  profile.id_verification_status === 'pending' ? 'Pending' :
                  profile.id_verification_status === 'rejected' ? 'Rejected' :
                  'Not submitted'
                }</dd>
              </div>
            </dl>
          </div>

          {/* Stats */}
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Stats</div>
            <div className="space-y-2 text-sm">
              {profile.role === 'customer' && (
                <>
                  <div className="flex justify-between"><span className="text-stone-500">Tasks posted</span><span className="font-medium">{tasks?.length ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">Completed</span><span className="font-medium">{completedTasks.length}</span></div>
                </>
              )}
              {profile.role === 'worker' && (
                <>
                  <div className="flex justify-between"><span className="text-stone-500">Offers submitted</span><span className="font-medium">{offers?.length ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">Accepted offers</span><span className="font-medium">{offers?.filter(o => o.status === 'accepted').length ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">Total earned</span><span className="font-medium">{formatCurrency(totalEarned)}</span></div>
                </>
              )}
              {avgRating && (
                <div className="flex justify-between"><span className="text-stone-500">Avg rating</span><span className="font-medium">★ {avgRating} ({reviews?.length})</span></div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Actions</div>
            <AdminUserActions
              userId={profile.id}
              currentRole={profile.role}
              suspended={profile.suspended ?? false}
              idVerificationStatus={profile.id_verification_status ?? null}
              hasSelfie={!!profile.id_selfie_url}
            />
          </div>

          {/* Admin notes */}
          <AdminUserNotes userId={profile.id} initialNotes={profile.admin_notes ?? ''} />
        </div>

        {/* Right columns — activity */}
        <div className="md:col-span-2 space-y-6">
          {profile.bio && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Bio</div>
              <p className="text-sm text-stone-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.role === 'worker' && Array.isArray(profile.professional_licenses) && profile.professional_licenses.length > 0 && (
            <AdminLicenseReview userId={profile.id} licenses={profile.professional_licenses} />
          )}

          {/* Tasks (customers) */}
          {profile.role === 'customer' && (
            <div className="bg-white border border-stone-200 rounded-lg">
              <div className="px-5 py-4 border-b border-stone-200">
                <h2 className="font-semibold text-stone-900">Tasks ({tasks?.length ?? 0})</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {!tasks?.length && <div className="px-5 py-4 text-sm text-stone-500">No tasks yet.</div>}
                {tasks?.map(t => (
                  <Link key={t.id} href={`/tasks/${t.id}`} target="_blank"
                    className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-stone-900">{t.title}</div>
                      <div className="text-xs text-stone-500">{formatRelativeDate(t.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.budget && <span className="text-xs text-stone-500">{formatCurrency(t.budget)}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                        t.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                        t.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>{t.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Offers (members) */}
          {profile.role === 'worker' && (
            <div className="bg-white border border-stone-200 rounded-lg">
              <div className="px-5 py-4 border-b border-stone-200">
                <h2 className="font-semibold text-stone-900">Offers ({offers?.length ?? 0})</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {!offers?.length && <div className="px-5 py-4 text-sm text-stone-500">No offers yet.</div>}
                {offers?.map(o => (
                  <Link key={o.id} href={`/tasks/${(o.tasks as any)?.id}`} target="_blank"
                    className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-stone-900">{(o.tasks as any)?.title}</div>
                      <div className="text-xs text-stone-400">{formatRelativeDate(o.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">{formatCurrency(o.amount)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                        o.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>{o.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg">
              <div className="px-5 py-4 border-b border-stone-200">
                <h2 className="font-semibold text-stone-900">Reviews received ({reviews.length})</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {reviews.map(r => (
                  <div key={r.id} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-xs text-stone-500">by {(r.users as any)?.name} · {formatRelativeDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-stone-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
