import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const config = {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  }

  try {
    const transporter = nodemailer.createTransport(config)
    await transporter.verify()
    const info = await transporter.sendMail({
      from: `"task.coop" <hello@taskcoop.org>`,
      to: process.env.BREVO_SMTP_USER,
      subject: 'SMTP test',
      text: 'SMTP connection is working.',
    })
    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, code: err.code }, { status: 500 })
  }
}
