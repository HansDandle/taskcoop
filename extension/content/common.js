// Phrases that strongly signal someone needs a service performed.
// Require enough specificity to avoid matching sales/wanted posts.
const TASK_KEYWORDS = [
  // Help-seeking phrases
  'need help with', 'need someone to', 'need a person', 'need someone who',
  'looking for someone to', 'looking for a handyman', 'looking for help',
  'can someone help', 'anyone available to', 'anyone able to',
  'hire someone', 'hiring someone', 'will pay',

  // Trade / service workers
  'handyman', 'plumber', 'electrician', 'carpenter', 'contractor',

  // Cleaning
  'deep clean', 'house cleaning', 'housekeeping', 'cleaning service',

  // Lawn / outdoor
  'lawn care', 'lawn mowing', 'mow my lawn', 'yard work',
  'landscaping', 'tree trimming', 'leaf blowing',

  // Moving / hauling
  'help moving', 'help me move', 'move furniture', 'haul away', 'junk removal',

  // Assembly / install
  'furniture assembly', 'ikea assembly', 'assemble furniture',
  'install a', 'mount a', 'hang a',

  // Repairs / improvements
  'fix my', 'need to fix', 'repair my', 'pressure washing',
  'paint my', 'patch the', 'drywall', 'tile work',
  'gutter cleaning', 'fence repair', 'deck repair',

  // Pet / personal services
  'dog walker', 'dog walking', 'pet sitter', 'pet sitting',
  'house sitter', 'house sitting', 'babysitter', 'childcare',

  // Generic paid task signals
  'odd jobs', 'odd job', 'paying cash',
]

// Posts matching any of these are skipped regardless of score.
const BLOCK_KEYWORDS = [
  'for sale', 'selling my', 'up for sale', 'moving sale',
  'garage sale', 'yard sale', 'estate sale',
  'ticket', 'tickets',
  'roommate', 'room for rent', 'sublet', 'sublease',
  'looking to buy', 'want to buy', 'wtb', 'wts',
  'giving away', 'giveaway', 'free to good home',
]

function scoreText(text) {
  const lower = text.toLowerCase()
  if (BLOCK_KEYWORDS.some(kw => lower.includes(kw))) return 0
  return TASK_KEYWORDS.filter(kw => lower.includes(kw)).length
}

// Sends detected leads to the background service worker for storage.
function sendLeads(leads) {
  if (leads.length === 0) return
  chrome.runtime.sendMessage({ type: 'NEW_LEADS', leads })
}
