import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-1">task<span className="text-emerald-600">.coop</span></div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Sign in</h2>
          <p className="mt-1 text-sm text-stone-500">Welcome back</p>
        </div>

        <form className="space-y-5" action={login}>
          {next && <input type="hidden" name="next" value={next} />}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email"
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500" />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

          <button type="submit" className="flex w-full justify-center rounded-md bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none transition-colors">
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-stone-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-emerald-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
