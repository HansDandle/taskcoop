const TASKCOOP_URL = 'https://taskcoop.org'

let allLeads = []
let activePlatform = 'all'

async function loadLeads() {
  const { leads = [] } = await chrome.storage.local.get('leads')
  allLeads = leads.sort((a, b) => b.foundAt - a.foundAt)
  renderLeads()
}

function renderLeads() {
  const list  = document.getElementById('leads-list')
  const empty = document.getElementById('empty')

  const filtered = activePlatform === 'all'
    ? allLeads
    : allLeads.filter(l => l.platform === activePlatform)

  // Update filter labels with counts
  document.querySelectorAll('.filter').forEach(btn => {
    const p     = btn.dataset.platform
    const count = p === 'all' ? allLeads.length : allLeads.filter(l => l.platform === p).length
    btn.textContent = p === 'all' ? `All (${count})` : `${capitalize(p)} (${count})`
  })

  list.innerHTML = ''

  if (filtered.length === 0) {
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')

  for (let i = 0; i < filtered.length; i++) {
    const lead = filtered[i]
    const li = document.createElement('li')
    li.className = 'lead'

    const meta = document.createElement('div')
    meta.className = 'lead-meta'
    const badge = document.createElement('span')
    badge.className = `platform-badge badge-${lead.platform}`
    badge.textContent = capitalize(lead.platform)
    meta.appendChild(badge)
    if (lead.location) {
      const loc = document.createElement('span')
      loc.className = 'lead-location'
      loc.textContent = lead.location
      meta.appendChild(loc)
    }

    const title = document.createElement('div')
    title.className = 'lead-title'
    title.textContent = lead.title

    const actions = document.createElement('div')
    actions.className = 'lead-actions'

    const offerBtn = document.createElement('button')
    offerBtn.className = 'offer-btn'
    offerBtn.innerHTML = 'Offer to help &rarr;'
    offerBtn.addEventListener('click', () => {
      const params = new URLSearchParams({
        from: 'extension',
        platform: lead.platform,
        title: lead.title,
        body: lead.body ?? '',
        url: lead.url ?? '',
        location: lead.location ?? '',
        id: lead.id,
      })
      chrome.tabs.create({ url: `${TASKCOOP_URL}/leadfeed?${params}` })
    })
    actions.appendChild(offerBtn)

    if (lead.url) {
      const viewLink = document.createElement('a')
      viewLink.className = 'view-link'
      viewLink.href = lead.url
      viewLink.target = '_blank'
      viewLink.rel = 'noopener noreferrer'
      viewLink.textContent = 'View original'
      actions.appendChild(viewLink)
    }

    const dismissBtn = document.createElement('button')
    dismissBtn.className = 'dismiss-btn'
    dismissBtn.textContent = '✕'
    dismissBtn.title = 'Dismiss'
    dismissBtn.addEventListener('click', async () => {
      allLeads = allLeads.filter(l => l.id !== lead.id)
      await chrome.storage.local.set({ leads: allLeads })
      renderLeads()
    })
    li.appendChild(dismissBtn)

    li.appendChild(meta)
    li.appendChild(title)
    li.appendChild(actions)
    list.appendChild(li)
  }
}

document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    activePlatform = btn.dataset.platform
    renderLeads()
  })
})

document.getElementById('clear-btn').addEventListener('click', async () => {
  await chrome.storage.local.set({ leads: [], badgeCount: 0 })
  chrome.action.setBadgeText({ text: '' })
  allLeads = []
  renderLeads()
})

// Clear badge when popup opens
chrome.storage.local.set({ badgeCount: 0 })
chrome.action.setBadgeText({ text: '' })

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

loadLeads()
