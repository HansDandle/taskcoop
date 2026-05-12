import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/utils'
import { APP_URL } from '@/lib/urls'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    '', '/tasks', '/how-it-works', '/cooperative', '/faq', '/austin',
    '/terms', '/privacy', '/worker-classification',
  ].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const categoryPages = CATEGORIES.map((cat) => ({
    url: `${APP_URL}/services/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categoryPages]
}
