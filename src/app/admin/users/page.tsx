import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import AdminUserActions from './admin-user-actions'

export const metadata: Metadata = { title: 'Admin — Users' }

const TABS = [
  { label: 'All', value: '' },
  { label: 'Customers', value: 'customer' },
  { label: 'Members', value: 'worker' },
  { label: 'Admins', value: 'admin' },
]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; verification?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase.rpc('get_my_role')
  if (roleData !== 'admin') redirect('/')

  const { role, q, verification } = await searchParams

  let query = supabase
    .from('users')
    .select('id, name, role, bio, created_at, suspended, id_verified, id_verification_status, admin_notes, id_document_url, id_selfie_url')
    .order('created_at', { ascending: false })

  if (role) query = query.eq('role', role)
  if (q) query = query.ilike('name', `%${q}%`)
  if (verification === 'pending') query = query.eq('id_verification_status', 'pending')

  const { data: users } = await query.limit(200)

  const pendingCount = users?.filter(u => u.id_verification_status === 'pending').length ?? 0
  const counts = {
    all: users?.length ?? 0,
    customer: users?.filter(u => u.role === 'customer').length ?? 0,
    worker: users?.filter(u => u.role === 'worker').length ?? 0,
    admin: users?.filter(u => u.role === 'admin').length ?? 0,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-700">← Admin</Link>
          <h1 className="text-2xl font-bold text-stone-900">Users</h1>
        </div>
        {pendingCount > 0 && (
          <Link href="/admin/users?verification=pending"
            className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-medium hover:bg-amber-200">
            {pendingCount} ID{pendingCount !== 1 ? 's' : ''} pending review
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-200">
        {TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/users?role=${tab.value}` : '/admin/users'}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              (role ?? '') === tab.value
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-stone-500">
              {tab.value === '' ? counts.all :
               tab.value === 'customer' ? counts.customer :
               tab.value === 'worker' ? counts.worker :
               counts.admin}
            </span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="flex gap-3 mb-5">
        {role && <input type="hidden" name="role" value={role} />}
        <input name="q" defaultValue={q} placeholder="Search by name…"
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />
        <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm">Search</button>
        {q && <Link href={role ? `/admin/users?role=${role}` : '/admin/users'} className="text-sm text-stone-500 self-center hover:underline">Clear</Link>}
      </form>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {!users?.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-500">No users found.</td></tr>
            )}
            {users?.map((u) => (
              <tr key={u.id} className={`hover:bg-stone-50 ${u.suspended ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900 hover:underline">{u.name}</span>
                      {u.id_verified && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">✓ ID</span>}
                      {u.id_verification_status === 'pending' && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">ID pending</span>}
                      {u.admin_notes && <span className="text-xs text-stone-400" title={u.admin_notes} aria-label="Has admin notes">📝</span>}
                    </div>
                    {u.bio && <div className="text-xs text-stone-500 truncate max-w-xs mt-0.5">{u.bio}</div>}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'worker' ? 'bg-blue-50 text-blue-700' :
                    u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                    'bg-stone-100 text-stone-600'
                  }`}>{u.role === 'worker' ? 'member' : u.role}</span>
                </td>
                <td className="px-4 py-3">
                  {u.suspended
                    ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Suspended</span>
                    : <span className="text-xs text-stone-500">Active</span>}
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <AdminUserActions
                    userId={u.id}
                    currentRole={u.role}
                    suspended={u.suspended ?? false}
                    idVerificationStatus={u.id_verification_status ?? null}
                    hasDocument={!!(u as any).id_document_url}
                    hasSelfie={!!(u as any).id_selfie_url}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
