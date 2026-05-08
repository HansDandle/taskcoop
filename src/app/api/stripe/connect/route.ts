import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('users').select('stripe_account_id').eq('id', user.id).single()

  let accountId = profile?.stripe_account_id
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' })
    accountId = account.id
    await supabase.from('users').update({ stripe_account_id: accountId }).eq('id', user.id)
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/api/stripe/connect`,
    return_url: `${origin}/dashboard?stripe=connected`,
    type: 'account_onboarding',
  })

  return Response.redirect(link.url)
}
