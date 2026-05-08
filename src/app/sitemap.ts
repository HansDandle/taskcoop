import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/utils'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://task.coop'
  const now = new Date()

  const staticPages = [
    '', '/tasks', '/how-it-works', '/cooperative', '/faq', '/austin',
    '/terms', '/privacy', '/worker-classification',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const categoryPages = CATEGORIES.map((cat) => ({
    url: `${base}/services/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categoryPages]
}
