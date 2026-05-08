import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import AdminUserActions from './admin-user-actions'

export const metadata: Metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { role, q } = await searchParams

  let query = supabase.from('users').select('id, name, role, bio, created_at').order('created_at', { ascending: false })
  if (role) query = query.eq('role', role)
  if (q) query = query.ilike('name', `%${q}%`)

  const { data: users } = await query.limit(100)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-700">← Admin</Link>
        <h1 className="text-2xl font-bold text-stone-900">Users</h1>
      </div>

      <form className="flex gap-3 mb-6">
        <input name="q" defaultValue={q} placeholder="Search by name…" className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <select name="role" defaultValue={role ?? ''} className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm">Filter</button>
      </form>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-stone-900">{u.name}</div>
                  {u.bio && <div className="text-xs text-stone-400 truncate max-w-xs">{u.bio}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'worker' ? 'bg-blue-50 text-blue-700' :
                    u.role === 'admin' ? 'bg-red-50 text-red-700' :
                    'bg-stone-100 text-stone-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-stone-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <AdminUserActions userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
