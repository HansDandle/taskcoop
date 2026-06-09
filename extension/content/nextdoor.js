// Nextdoor is a React SPA — posts load dynamically.
// We observe DOM mutations and re-scan whenever new content appears.

const SEEN_IDS = new Set()

function extractPosts() {
  const found = []

  // Nextdoor changes class names frequently; we cast a wide net with
  // multiple selectors and fall back to any <article> on the page.
  const candidates = [
    ...document.querySelectorAll('[data-testid="post-card"]'),
    ...document.querySelectorAll('[data-testid="feed-post-wrapper"]'),
    ...document.querySelectorAll('article'),
  ]

  for (const el of candidates) {
    if (el.textContent.trim().length < 40) continue

    const titleEl = el.querySelector('h2, h3, [class*="title" i], [class*="Title"]')
    const bodyEl  = el.querySelector('p, [class*="body" i], [class*="content" i], [class*="text" i]')
    const title   = titleEl?.textContent?.trim() ?? ''
    const body    = bodyEl?.textContent?.trim()  ?? ''
    const text    = `${title} ${body}`

    if (scoreText(text) === 0) continue

    const linkEl = el.querySelector('a[href*="/p/"], a[href*="/posts/"]')
    const url    = linkEl ? new URL(linkEl.getAttribute('href'), 'https://nextdoor.com').href
                          : window.location.href

    if (SEEN_IDS.has(url)) continue
    SEEN_IDS.add(url)

    const metaEl   = el.querySelector('[class*="neighborhood" i], [class*="location" i]')
    const location = metaEl?.textContent?.trim() ?? ''

    found.push({
      id: url,
      platform: 'nextdoor',
      title: title || text.slice(0, 80),
      body: body.slice(0, 300),
      url,
      location,
      foundAt: Date.now(),
    })
  }

  sendLeads(found)
}

extractPosts()

const observer = new MutationObserver(() => extractPosts())
observer.observe(document.body, { childList: true, subtree: true })
