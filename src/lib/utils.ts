import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date) {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export const CATEGORIES = [
  { name: 'Handyman', slug: 'handyman', icon: '🔧', group: 'Home' },
  { name: 'Furniture Assembly', slug: 'furniture-assembly', icon: '🪑', group: 'Home' },
  { name: 'TV Mounting', slug: 'tv-mounting', icon: '📺', group: 'Home' },
  { name: 'Tech & Smart Home', slug: 'tech-home', icon: '📡', group: 'Tech' },
  { name: 'Yard Work', slug: 'yard-work', icon: '🌿', group: 'Outdoor' },
  { name: 'Outdoor & Pressure Washing', slug: 'outdoor', icon: '💧', group: 'Outdoor' },
  { name: 'Cleaning', slug: 'cleaning', icon: '🧹', group: 'Home' },
  { name: 'Moving Help', slug: 'moving-help', icon: '📦', group: 'Moving' },
  { name: 'Junk Removal', slug: 'junk-removal', icon: '🚛', group: 'Moving' },
]
