import Link from 'next/link'
import SignupForm from './signup-form'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string; ref?: string }>
}) {
  const { error, role, ref } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-1">task<span className="text-emerald-600">.coop</span></div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Create an account</h2>
          <p className="mt-1 text-sm text-stone-500">
            {ref ? "You were invited by a task.coop member" : "Join the member-owned marketplace"}
          </p>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

        <SignupForm role={role} ref={ref} />

        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
