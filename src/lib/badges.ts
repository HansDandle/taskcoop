import { CATEGORIES } from './utils'

export interface BadgeData {
  idVerified: boolean
  stripeOnboarded: boolean
  createdAt: string
  completedJobCount: number
  avgRating: number | null
  reviewCount: number
  qualifiedReferrals: number
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
      id: 'coop_builder',
      name: 'Cooperative Builder',
      description: 'Referred 5 members or customers who transacted',
      icon: '🤝',
      earned: data.qualifiedReferrals >= 5,
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
