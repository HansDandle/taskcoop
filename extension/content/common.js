// Phrases that strongly signal someone needs a service performed.
// Require enough specificity to avoid matching sales/wanted posts.
const TASK_KEYWORDS = [
  // Recommendation requests (huge category on Nextdoor/Facebook)
  'recommendations', 'recommendation', 'recs', 'rec for', 'good rec',
  'recommend someone', 'recommend a',
  'anyone recommend', 'have a recommendation', 'need a recommendation',
  'know a good', 'know someone who', 'know anyone who',
  'looking for a good', 'looking for someone', 'looking for a',

  // Help-seeking phrases
  'need help with', 'need someone to', 'need a person', 'need someone who',
  'looking for help', 'looking for quotes',
  'can someone help', 'anyone available to', 'anyone able to',
  'hire someone', 'hiring someone', 'will pay',

  // Trade / service workers
  'handyman', 'plumber', 'electrician', 'carpenter', 'contractor',
  'repair man', 'repairman', 'service man', 'serviceman', 'technician',
  'specialist', 'professional',

  // Cleaning
  'deep clean', 'house cleaning', 'housekeeping', 'cleaning service', 'house cleaner',
  'window cleaning', 'window cleaner', 'window washing', 'screen cleaning',

  // Lawn / outdoor
  'lawn care', 'lawn mowing', 'lawn service', 'lawn maintenance', 'lawn expert',
  'mow my lawn', 'mow the lawn', 'grass cut', 'grass cutting',
  'yard work', 'yard service', 'yard maintenance',
  'landscaping', 'landscaper',
  'tree trimming', 'tree removal', 'tree care', 'tree service', 'tree specialist',
  'remove a tree', 'cut down a tree', 'trim a tree', 'cut a tree',
  'haul it', 'haul the', 'haul away',
  'leaf blowing', 'stump removal', 'stump grinding',
  're-sod', 'resod', 'sod installation',

  // Moving / hauling
  'help moving', 'help me move', 'help move', 'move furniture', 'moving furniture',
  'junk removal', 'junk haul', 'mattress removal', 'mattress disposal',
  'need movers', 'looking for movers', 'hire movers', 'movers',

  // Assembly / install
  'furniture assembly', 'ikea assembly', 'assemble furniture',
  'install a', 'mount a', 'hang a',

  // Repairs / improvements
  'fix my', 'need to fix', 'repair my', 'needs repair', 'needs to be repaired',
  'pressure washing', 'power washing',
  'paint my', 'patch the', 'drywall', 'tile work',
  'gutter cleaning', 'fence repair', 'deck repair',
  'appliance repair', 'refrigerator repair', 'ac repair', 'hvac',

  // Pet / personal services
  'dog walker', 'dog walking', 'pet sitter', 'pet sitting',
  'house sitter', 'house sitting', 'babysitter', 'childcare',

  // Generic paid task signals
  'odd jobs', 'odd job', 'paying cash', 'earn some cash', 'earn cash', 'make some cash',
  'wants to earn', 'want to earn', 'make money',
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
// Guards against the extension context being invalidated (e.g. after a reload)
// which leaves content scripts orphaned with no runtime connection.
function sendLeads(leads) {
  if (leads.length === 0) return
  if (!chrome.runtime?.id) return
  try {
    chrome.runtime.sendMessage({ type: 'NEW_LEADS', leads })
  } catch (e) {
    // Swallow "Extension context invalidated" — page needs a refresh
  }
}
