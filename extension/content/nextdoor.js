// Nextdoor is a React SPA — posts load dynamically.
// We observe DOM mutations and re-scan whenever new content appears.
//
// Selectors derived from observed DOM (June 2025). Nextdoor obfuscates
// class names but data-testid attributes are stable across deploys.

const SEEN_IDS = new Set()

function extractPosts() {
  const found = []

  for (const bodyEl of document.querySelectorAll('[data-testid="post-body"]')) {
    // Walk up to the nearest ancestor that also contains author info,
    // so we can pull the neighborhood name from the same post.
    const container = bodyEl.closest('.cee-media-body') ?? bodyEl.parentElement

    const textEl = bodyEl.querySelector('[data-testid="styled-text"]')
                ?? bodyEl.querySelector('.postTextBodySpan')
    const text = textEl?.textContent?.trim() ?? bodyEl.textContent?.trim() ?? ''
    if (!text || scoreText(text) === 0) continue

    // Stable ID from a hash of the text — no permalink available in the feed DOM.
    const id = 'nd-' + quickHash(text.slice(0, 120))
    if (SEEN_IDS.has(id)) continue
    SEEN_IDS.add(id)

    const neighborhoodLink = container?.querySelector('a[href*="/neighborhood/"]')
    const location = neighborhoodLink?.textContent?.trim() ?? ''

    // Try to find the post permalink (/p/{id}) anywhere in the container.
    // Nextdoor uses JS navigation so the href may not always be present.
    const postLinkEl = container?.querySelector('a[href*="/p/"]')
    const postPath = postLinkEl?.getAttribute('href')
    const url = postPath
      ? new URL(postPath, 'https://nextdoor.com').href
      : window.location.href

    found.push({
      id,
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

function quickHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

extractPosts()

const observer = new MutationObserver(() => extractPosts())
observer.observe(document.body, { childList: true, subtree: true })
