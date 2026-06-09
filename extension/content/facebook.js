// Facebook Groups only — matched by host_permissions in manifest.json.
// Facebook's class names are hashed and change with every deploy;
// role="article" is the only stable anchor for post containers.

const SEEN_IDS = new Set()

function extractPosts() {
  const found = []

  const articles = document.querySelectorAll('[role="article"]')
  for (const article of articles) {
    const textNodes = [...article.querySelectorAll('div[dir="auto"]')]
      .map(el => el.textContent.trim())
      .filter(t => t.length > 25)

    if (textNodes.length === 0) continue

    const fullText = textNodes.join(' ')
    if (scoreText(fullText) === 0) continue

    const timeLink = article.querySelector(
      'a[href*="/posts/"], a[href*="/permalink/"], a[href*="story_fbid"]'
    )
    const url = timeLink?.href ?? window.location.href

    if (SEEN_IDS.has(url)) continue
    SEEN_IDS.add(url)

    found.push({
      id: url,
      platform: 'facebook',
      title: textNodes[0].slice(0, 100),
      body: textNodes.slice(1).join(' ').slice(0, 300),
      url,
      location: '',
      foundAt: Date.now(),
    })
  }

  sendLeads(found)
}

extractPosts()

const observer = new MutationObserver(() => extractPosts())
observer.observe(document.body, { childList: true, subtree: true })
