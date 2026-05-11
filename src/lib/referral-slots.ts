import { createClient as createServiceClient } from '@supabase/supabase-js'

export const REFERRAL_CATEGORIES = [
  { id: 'home', label: 'Home & Handyman', icon: '🔧' },
  { id: 'tech', label: 'Tech & Smart Home', icon: '📡' },
  { id: 'outdoor', label: 'Outdoor & Yard', icon: '🌿' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'moving', label: 'Moving & Hauling', icon: '📦' },
]

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6)
}

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function generateSlotsForUser(userId: string) {
  const supabase = serviceClient()
  const slots = REFERRAL_CATEGORIES.flatMap(({ id: category }) =>
    [1, 2, 3, 4, 5].map(slot_number => ({
      referrer_id: userId,
      category,
      slot_number,
      code: generateCode(),
    }))
  )
  await supabase.from('referral_slots').insert(slots)
}

export async function markSlotUsed(code: string, referredUserId: string) {
  const supabase = serviceClient()
  await supabase
    .from('referral_slots')
    .update({ referred_user_id: referredUserId })
    .eq('code', code)
    .is('referred_user_id', null)
}

export async function resolveSlotCode(code: string): Promise<string | null> {
  const supabase = serviceClient()
  const { data } = await supabase
    .from('referral_slots')
    .select('referrer_id')
    .eq('code', code)
    .is('referred_user_id', null)
    .single()
  return data?.referrer_id ?? null
}
