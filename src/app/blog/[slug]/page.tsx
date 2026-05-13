import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://task.coop/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `https://task.coop/blog/${post.slug}` },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author ?? 'task.coop', url: 'https://task.coop' },
    publisher: { '@type': 'Organization', name: 'task.coop', url: 'https://task.coop' },
    mainEntityOfPage: `https://task.coop/blog/${post.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-sm text-stone-500 hover:text-stone-700 block mb-8">← Blog</Link>

        <article>
          <header className="mb-8">
            <time className="text-xs text-stone-400 uppercase tracking-wide">{post.date}</time>
            <h1 className="text-3xl font-bold text-stone-900 mt-2 leading-tight">{post.title}</h1>
            <p className="text-stone-500 mt-3 text-lg leading-relaxed">{post.description}</p>
            {post.tags && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-stone prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-headings:text-stone-900 max-w-none">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  const isInternal = href?.startsWith('/')
                  return (
                    <a href={href} {...(!isInternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {children}
                    </a>
                  )
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-stone-600 text-sm">
            task.coop is Austin&apos;s worker-owned local services cooperative. Members keep 95% of every job.{' '}
            <Link href="/tasks/new" className="text-emerald-600 hover:underline">Post a task</Link> or{' '}
            <Link href="/signup?role=worker" className="text-emerald-600 hover:underline">join as a member</Link>.
          </p>
        </div>
      </div>
    </>
  )
}
