'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const next = (formData.get('next') as string) || '/dashboard'
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=Invalid+email+or+password${next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`)
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const ref = formData.get('ref') as string | null
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        role: formData.get('role') as string,
        ...(ref ? { referred_by: ref } : {}),
      }
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Mark referral slot as used
  if (ref && signUpData?.user?.id) {
    const { markSlotUsed } = await import('@/lib/referral-slots')
    await markSlotUsed(ref, signUpData.user.id).catch(() => {})
  }

  redirect('/signup/confirmed')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=Could+not+sign+in+with+Google')
  }

  redirect(data.url)
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
