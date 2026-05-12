import type { MetadataRoute } from 'next'
import { APP_URL } from '@/lib/urls'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/dashboard', '/profile', '/messages/'] },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
