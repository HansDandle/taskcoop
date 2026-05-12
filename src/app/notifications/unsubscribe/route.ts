import { NextResponse, type NextRequest } from 'next/server'
import { applyUnsubscribe, verifyUnsubscribeToken } from '@/lib/notification-prefs'

async function handle(token: string | null, request: NextRequest) {
  if (!token) {
    return NextResponse.redirect(new URL('/notifications/unsubscribe/invalid', request.url))
  }
  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    return NextResponse.redirect(new URL('/notifications/unsubscribe/invalid', request.url))
  }
  await applyUnsubscribe(verified.userId, verified.type)
  return NextResponse.redirect(
    new URL(`/notifications/unsubscribe/done?type=${verified.type}`, request.url),
  )
}

export async function GET(request: NextRequest) {
  return handle(new URL(request.url).searchParams.get('token'), request)
}

// Some email clients (Gmail, Yahoo) post to List-Unsubscribe URLs
export async function POST(request: NextRequest) {
  return handle(new URL(request.url).searchParams.get('token'), request)
}
