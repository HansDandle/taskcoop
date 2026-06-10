// Facebook Groups only — matched by host_permissions in manifest.json.
// Post structure (confirmed from live DOM):
//   - Posts are role="article" with an h2 for the author name
//   - Comments are role="article" nested inside the post article
//   - Post body text: try data-ad-rendering-role="story_message", then
//     data-ad-preview="message", then data-ad-comet-preview="message",
//     then clone-and-strip-comments fallback

const SEEN_IDS = new Set()

function extractPostText(article) {
  let node = article.querySelector('[data-ad-rendering-role="story_message"]')
  if (node?.textContent?.trim()) return node.textContent.trim()

  node = article.querySelector('[data-ad-preview="message"]')
  if (node?.textContent?.trim()) return node.textContent.trim()

  node = article.querySelector('[data-ad-comet-preview="message"]')
  if (node?.textContent?.trim()) return node.textContent.trim()

  // Last resort: clone and strip nested comment articles
  const clone = article.cloneNode(true)
  clone.querySelectorAll('[role="article"]').forEach(el => {
    if (el !== clone) el.remove()
  })
  return clone.textContent.trim()
}

function extractPosts() {
  const found = []

  const messageEls = document.querySelectorAll('[data-ad-rendering-role="story_message"]')

  for (const el of messageEls) {
    const rawText = el.textContent.trim()
    if (!rawText) continue
    if (scoreText(rawText) === 0) continue

    const id = rawText.slice(0, 120)
    if (SEEN_IDS.has(id)) continue
    SEEN_IDS.add(id)

    // Walk up to find the nearest ancestor with a post permalink
    let ancestor = el.parentElement
    let postLink = null
    while (ancestor && ancestor !== document.body) {
      postLink = ancestor.querySelector(
        'a[href*="/posts/"], a[href*="/permalink/"], a[href*="story_fbid"]'
      )
      if (postLink && !postLink.href.includes('comment_id')) break
      postLink = null
      ancestor = ancestor.parentElement
    }

    found.push({
      id,
      platform: 'facebook',
      title: rawText.slice(0, 100),
      body: rawText.slice(100, 500),
      url: postLink?.href ?? null,
      location: '',
      foundAt: Date.now(),
    })
  }

  sendLeads(found)
}

extractPosts()

let debounceTimer = null
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(extractPosts, 300)
})
observer.observe(document.body, { childList: true, subtree: true })
