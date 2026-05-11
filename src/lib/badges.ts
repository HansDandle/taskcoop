import { CATEGORIES } from './utils'
import { REFERRAL_CATEGORIES } from './referral-slots'

export interface BadgeData {
  idVerified: boolean
  stripeOnboarded: boolean
  createdAt: string
  completedJobCount: number
  avgRating: number | null
  reviewCount: number
  referralSlots: { category: string; referred_user_id: string | null }[]
  completedJobsByCategory: Record<string, number>
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
}

const EARLY_MEMBER_CUTOFF = new Date('2027-05-01')

export function computeBadges(data: BadgeData): Badge[] {
  const usedByCategory = Object.fromEntries(
    REFERRAL_CATEGORIES.map(cat => [
      cat.id,
      data.referralSlots.filter(s => s.category === cat.id && s.referred_user_id).length,
    ])
  )
  const hasAnyInEach = REFERRAL_CATEGORIES.every(cat => (usedByCategory[cat.id] ?? 0) >= 1)
  const allFull = REFERRAL_CATEGORIES.every(cat => (usedByCategory[cat.id] ?? 0) >= 5)

  const badges: Badge[] = [
    {
      id: 'id_verified',
      name: 'ID Verified',
      description: 'Identity confirmed by the platform',
      icon: '🪪',
      earned: data.idVerified,
    },
    {
      id: 'stripe_connected',
      name: 'Stripe Connected',
      description: 'Bank account set up to receive payments',
      icon: '🏦',
      earned: data.stripeOnboarded,
    },
    {
      id: 'reliable',
      name: 'Reliable',
      description: 'Completed 25 jobs',
      icon: '⭐',
      earned: data.completedJobCount >= 25,
    },
    {
      id: 'veteran',
      name: 'Veteran',
      description: 'Completed 100 jobs',
      icon: '🏆',
      earned: data.completedJobCount >= 100,
    },
    {
      id: 'top_rated',
      name: 'Top Rated',
      description: '4.8+ average rating with at least 5 reviews',
      icon: '🌟',
      earned: data.reviewCount >= 5 && (data.avgRating ?? 0) >= 4.8,
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score',
      description: '5.0 average rating with at least 3 reviews',
      icon: '💯',
      earned: data.reviewCount >= 3 && data.avgRating === 5.0,
    },
    {
      id: 'team_builder',
      name: 'Team Builder',
      description: 'Recruited at least one person in every category',
      icon: '🤝',
      earned: hasAnyInEach,
    },
    {
      id: 'full_roster',
      name: 'Full Roster',
      description: 'Filled all 25 referral slots',
      icon: '🌐',
      earned: allFull,
    },
    {
      id: 'early_member',
      name: 'Early Member',
      description: 'Joined task.coop in its first year',
      icon: '🌱',
      earned: new Date(data.createdAt) < EARLY_MEMBER_CUTOFF,
    },
    // Category specialization badges
    ...CATEGORIES.map(cat => ({
      id: `cat_${cat.slug}`,
      name: `${cat.name} Pro`,
      description: `Completed 5+ ${cat.name.toLowerCase()} jobs`,
      icon: cat.icon,
      earned: (data.completedJobsByCategory[cat.name] ?? 0) >= 5,
    })),
  ]

  return badges
}
