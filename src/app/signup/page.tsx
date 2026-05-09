import { signup } from '@/app/auth/actions'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>
}) {
  const { error, role } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-1">task<span className="text-emerald-600">.coop</span></div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Create an account</h2>
          <p className="mt-1 text-sm text-stone-500">Join the member-owned marketplace</p>
        </div>

        <form className="space-y-5" action={signup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-stone-700">Full name</label>
              <input id="full_name" name="full_name" type="text" required autoComplete="name"
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email"
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
              <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8}
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">I want to…</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center gap-2 border border-stone-300 rounded-lg p-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
                  <input type="radio" name="role" value="customer" defaultChecked={role !== 'worker'} className="sr-only" />
                  <span className="text-2xl">📋</span>
                  <span className="text-sm font-medium text-stone-800">Post Tasks</span>
                  <span className="text-xs text-stone-500 text-center">Find local members</span>
                </label>
                <label className="flex flex-col items-center gap-2 border border-stone-300 rounded-lg p-3 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
                  <input type="radio" name="role" value="worker" defaultChecked={role === 'worker'} className="sr-only" />
                  <span className="text-2xl">🔨</span>
                  <span className="text-sm font-medium text-stone-800">Work & Earn</span>
                  <span className="text-xs text-stone-500 text-center">Keep 95% of every job</span>
                </label>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

          <button type="submit" className="flex w-full justify-center rounded-md bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none transition-colors">
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
