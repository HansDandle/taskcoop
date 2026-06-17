import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ContactForm from './contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the task.coop team.',
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // The authenticated user's email comes straight from the auth session
  const email: string | undefined = user?.email ?? undefined

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Contact us</h1>
      <p className="text-stone-500 text-sm mb-8">
        Questions, problems, or just want to say hello? Fill out the form and we'll get back to you within one business day.
      </p>
      <ContactForm defaultEmail={email} />
    </div>
  )
}
