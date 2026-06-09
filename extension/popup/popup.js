// Change to 'https://taskcoop.org' for production
const TASKCOOP_URL = 'http://localhost:3000'

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

  for (const lead of filtered) {
    const li = document.createElement('li')
    li.className = 'lead'
    li.innerHTML = `
      <div class="lead-meta">
        <span class="platform-badge badge-${lead.platform}">${capitalize(lead.platform)}</span>
        ${lead.location ? `<span class="lead-location">${esc(lead.location)}</span>` : ''}
      </div>
      <div class="lead-title">${esc(lead.title)}</div>
      <div class="lead-actions">
        <button class="offer-btn" data-lead='${JSON.stringify(lead)}'>Offer to help &rarr;</button>
        ${lead.url ? `<a class="view-link" href="${esc(lead.url)}" target="_blank">View original</a>` : ''}
      </div>
    `
    list.appendChild(li)
  }

  // Opens /nextdoor with the post pre-populated so the worker goes straight to the offer form
  list.querySelectorAll('.offer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lead   = JSON.parse(btn.dataset.lead)
      const params = new URLSearchParams({
        from: 'extension',
        platform: lead.platform,
        title: lead.title,
        body: lead.body ?? '',
        url: lead.url ?? '',
        location: lead.location ?? '',
        id: lead.id,
      })
      chrome.tabs.create({ url: `${TASKCOOP_URL}/nextdoor?${params}` })
    })
  })
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
