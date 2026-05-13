import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and local knowledge about home services, tech setup, and cooperative work in Austin, TX.',
  openGraph: {
    title: 'Blog — task.coop',
    description: 'Tips, guides, and local knowledge about home services, tech setup, and cooperative work in Austin, TX.',
    url: 'https://task.coop/blog',
    type: 'website',
  },
  alternates: { canonical: 'https://task.coop/blog' },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Blog</h1>
      <p className="text-stone-500 mb-10">Tips, guides, and local knowledge from Austin's worker-owned services cooperative.</p>

      {posts.length === 0 ? (
        <p className="text-stone-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <time className="text-xs text-stone-400 uppercase tracking-wide">{post.date}</time>
                <h2 className="text-xl font-bold text-stone-900 mt-1 group-hover:text-emerald-700 transition-colors">
                  {post.title}
                </h2>
                <p className="text-stone-600 mt-2 leading-relaxed">{post.description}</p>
                <span className="text-sm text-emerald-600 font-medium mt-2 inline-block group-hover:underline">
                  Read more →
                </span>
              </Link>
              {post.tags && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
