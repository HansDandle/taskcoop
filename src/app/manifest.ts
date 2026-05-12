import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'task.coop',
    short_name: 'task.coop',
    description: 'Austin\'s local services cooperative. Find trusted local help for home, tech, and everyday tasks.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#059669',
    orientation: 'portrait',
    categories: ['business', 'productivity', 'lifestyle'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Post a task',
        short_name: 'Post',
        url: '/tasks/new',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Browse tasks',
        short_name: 'Browse',
        url: '/tasks',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Messages',
        short_name: 'Messages',
        url: '/messages',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
