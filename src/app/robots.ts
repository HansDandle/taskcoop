import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/profile',
          '/messages',
          '/admin',
          '/api',
          '/tasks/new',
          '/tasks/*/edit',
          '/tasks/*/review',
          '/offline',
        ],
      },
    ],
    sitemap: 'https://task.coop/sitemap.xml',
  }
}
