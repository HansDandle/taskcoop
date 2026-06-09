// Nextdoor is a React SPA — posts load dynamically.
// We observe DOM mutations and re-scan whenever new content appears.
//
// Selectors verified June 2026:
//   Feed items: [data-testid^="dwell-tracker-searchFeedItem:"] (search page)
//               [data-testid^="dwell-tracker-feedItem:"]       (news feed)
//   Post text:  [data-testid="styled-text"]

const SEEN_IDS = new Set()

function extractPosts() {
  const found = []

  const containers = document.querySelectorAll(
    '[data-testid^="dwell-tracker-searchFeedItem:"], [data-testid^="dwell-tracker-feedItem:"]'
  )

  for (const el of containers) {
    // The UUID after the colon is Nextdoor's internal post ID — stable and unique.
    const postId = 'nd-' + el.dataset.testid.split(':')[1]
    if (SEEN_IDS.has(postId)) continue

    const textEl = el.querySelector('[data-testid="styled-text"]')
    const text = textEl?.textContent?.trim() ?? ''
    if (!text || scoreText(text) === 0) continue

    SEEN_IDS.add(postId)

    const neighborhoodLink = el.querySelector('a[href*="/neighborhood/"]')
    const location = neighborhoodLink?.textContent?.trim() ?? ''

    const postLinkEl = el.querySelector('a[href*="/p/"]')
    const postPath = postLinkEl?.getAttribute('href')
    const url = postPath
      ? new URL(postPath, 'https://nextdoor.com').href
      : `https://nextdoor.com/search/posts/?query=${encodeURIComponent(text.slice(0, 80).trim())}`

    found.push({
      id: postId,
      platform: 'nextdoor',
      title: text.slice(0, 100),
      body: text.slice(0, 400),
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
