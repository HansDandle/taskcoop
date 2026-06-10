// Receives leads from the MAIN world craigslist.js and forwards to the service worker.
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data?.type !== 'TASKCOOP_NEW_LEADS') return
  if (!chrome.runtime?.id) return
  try {
    chrome.runtime.sendMessage({ type: 'NEW_LEADS', leads: event.data.leads })
  } catch (e) {
    // Extension context invalidated
  }
})
