// Craigslist has stable, semantic HTML — no SPA, no hashed classes.
// We scan listing titles on search result pages and individual posts.

const SEEN_IDS = new Set()

function extractPosts() {
  const found = []

  const items = [
    ...document.querySelectorAll('li.cl-search-result'),
    ...document.querySelectorAll('li.result-row'),
  ]

  for (const item of items) {
    const titleEl = item.querySelector(
      '.cl-app-anchor .label, a.result-title, a.posting-title'
    )
    const title = titleEl?.textContent?.trim()
    if (!title || scoreText(title) === 0) continue

    const linkEl  = item.querySelector('a')
    const url     = linkEl?.href ?? ''
    if (SEEN_IDS.has(url || title)) continue
    SEEN_IDS.add(url || title)

    const priceEl  = item.querySelector('.price, .result-price')
    const metaEl   = item.querySelector('.result-hood, .cl-app-anchor .meta')
    const location = metaEl?.textContent?.trim().replace(/[()]/g, '') ?? ''

    found.push({
      id: url || title,
      platform: 'craigslist',
      title,
      body: '',
      url,
      location,
      price: priceEl?.textContent?.trim() ?? null,
      foundAt: Date.now(),
    })
  }

  // Individual listing page
  if (found.length === 0 && document.querySelector('#postingbody')) {
    const title = document.querySelector('#titletextonly, h1.postingtitle')?.textContent?.trim() ?? ''
    const body  = document.querySelector('#postingbody')?.textContent?.trim().slice(0, 300) ?? ''
    const url   = window.location.href

    if (scoreText(`${title} ${body}`) > 0 && !SEEN_IDS.has(url)) {
      SEEN_IDS.add(url)
      found.push({ id: url, platform: 'craigslist', title: title || body.slice(0, 80), body, url, location: '', price: null, foundAt: Date.now() })
    }
  }

  sendLeads(found)
}

extractPosts()
