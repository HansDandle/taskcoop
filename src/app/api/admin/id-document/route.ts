import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const path = req.nextUrl.searchParams.get('path')
  // Validate path format: <uuid>/[id|selfie|license/]<filename>.<ext>
  // Older single-folder uploads (uuid/timestamp.ext) and new typed uploads
  // (uuid/id|selfie|license/timestamp[-suffix].ext) are both accepted.
  // No traversal allowed.
  const legacy = /^[0-9a-f-]{36}\/\d+\.[a-z0-9]{2,4}$/i
  const typed = /^[0-9a-f-]{36}\/(id|selfie|license)\/\d+(?:-[a-z0-9]+)?\.[a-z0-9]{2,4}$/i
  if (!path || (!legacy.test(path) && !typed.test(path))) {
    return new NextResponse('Invalid path', { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await service.storage
    .from('id-documents')
    .createSignedUrl(path, 60) // 60 second expiry

  if (error || !data) return new NextResponse('Not found', { status: 404 })

  return NextResponse.redirect(data.signedUrl)
}
