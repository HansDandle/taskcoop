// Handles both new Reddit (shreddit) and old Reddit.

const SEEN_IDS = new Set()

function extractPosts() {
  const found = []

  const newPosts = [
    ...document.querySelectorAll('[data-testid="post-container"]'),
    ...document.querySelectorAll('shreddit-post'),
  ]

  for (const post of newPosts) {
    const titleEl = post.querySelector('h3, [slot="title"], a[data-click-id="body"]')
    const title   = titleEl?.textContent?.trim()
    if (!title || scoreText(title) === 0) continue

    const linkEl = post.querySelector('a[data-click-id="body"], a[href*="/comments/"]')
    const url    = linkEl ? new URL(linkEl.getAttribute('href'), window.location.origin).href
                          : window.location.href

    if (SEEN_IDS.has(url)) continue
    SEEN_IDS.add(url)

    const subEl    = post.querySelector('[data-testid="subreddit-name"], a[href*="/r/"]')
    const location = subEl?.textContent?.trim() ?? ''

    found.push({ id: url, platform: 'reddit', title, body: '', url, location, foundAt: Date.now() })
  }

  // Old Reddit fallback
  if (found.length === 0) {
    document.querySelectorAll('.thing .title a.title').forEach(a => {
      const title = a.textContent.trim()
      if (scoreText(title) === 0 || SEEN_IDS.has(a.href)) return
      SEEN_IDS.add(a.href)
      found.push({ id: a.href, platform: 'reddit', title, body: '', url: a.href, location: '', foundAt: Date.now() })
    })
  }

  sendLeads(found)
}

extractPosts()

const observer = new MutationObserver(() => extractPosts())
observer.observe(document.body, { childList: true, subtree: true })
