'use server'

import { sendContactEmail } from '@/lib/email'

export async function submitContact(formData: FormData) {
  const from = (formData.get('email') as string).trim()
  const subject = (formData.get('subject') as string).trim()
  const category = formData.get('category') as string
  const message = (formData.get('message') as string).trim()

  if (!from || !subject || !category || !message) {
    return { error: 'All fields are required.' }
  }
  if (message.length > 4000) {
    return { error: 'Message is too long.' }
  }

  await sendContactEmail(from, subject, category, message)
  return { success: true }
}
