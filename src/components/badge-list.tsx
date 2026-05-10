import type { Badge } from '@/lib/badges'

export default function BadgeList({ badges, showUnearned = false }: { badges: Badge[]; showUnearned?: boolean }) {
  const visible = showUnearned ? badges : badges.filter(b => b.earned)
  if (visible.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map(badge => (
        <div
          key={badge.id}
          title={badge.description}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            badge.earned
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-stone-50 border-stone-200 text-stone-400 opacity-50'
          }`}
        >
          <span>{badge.icon}</span>
          <span>{badge.name}</span>
        </div>
      ))}
    </div>
  )
}
