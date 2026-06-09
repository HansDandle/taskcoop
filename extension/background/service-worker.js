const MAX_LEADS = 200
const LEAD_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'NEW_LEADS') addLeads(message.leads)
})

async function addLeads(incoming) {
  const { leads = [], badgeCount = 0 } = await chrome.storage.local.get(['leads', 'badgeCount'])
  const now = Date.now()

  const fresh = leads.filter(l => now - l.foundAt < LEAD_TTL_MS)
  const existingIds = new Set(fresh.map(l => l.id))
  const toAdd = incoming.filter(l => !existingIds.has(l.id))

  if (toAdd.length === 0) return

  const updated = [...toAdd, ...fresh].slice(0, MAX_LEADS)
  const newBadgeCount = badgeCount + toAdd.length

  await chrome.storage.local.set({ leads: updated, badgeCount: newBadgeCount })
  chrome.action.setBadgeText({ text: newBadgeCount > 99 ? '99+' : String(newBadgeCount) })
  chrome.action.setBadgeBackgroundColor({ color: '#059669' })
}
