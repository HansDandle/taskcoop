// Keywords that signal someone needs a task done.
// Scored by count — more matches = more relevant.
const TASK_KEYWORDS = [
  'need help', 'need someone', 'looking for', 'anyone know', 'can someone',
  'recommendation', 'recommend', 'anyone available',
  'handyman', 'plumber', 'electrician', 'carpenter', 'contractor',
  'cleaning', 'cleaner', 'deep clean', 'housekeeping',
  'mow', 'mowing', 'lawn', 'yard work', 'landscaping', 'tree trimming',
  'moving', 'move furniture', 'help moving', 'haul', 'junk removal',
  'furniture assembly', 'assemble', 'ikea',
  'fix', 'repair', 'install', 'paint', 'painter', 'pressure wash',
  'gutter', 'fence', 'deck', 'drywall', 'tile',
  'odd jobs', 'odd job', 'will pay', 'paying',
]

function scoreText(text) {
  const lower = text.toLowerCase()
  return TASK_KEYWORDS.filter(kw => lower.includes(kw)).length
}

// Sends detected leads to the background service worker for storage.
function sendLeads(leads) {
  if (leads.length === 0) return
  chrome.runtime.sendMessage({ type: 'NEW_LEADS', leads })
}
