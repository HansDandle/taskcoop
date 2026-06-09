# TaskCoop Lead Finder — Chrome Extension

Aggregates task-related posts from Nextdoor, Facebook Groups, Craigslist, and Reddit into a single feed. Works entirely client-side — no data leaves your browser except to open taskcoop.org when you click "Offer to help."

## Loading unpacked (for development)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` directory

The extension icon will appear in your toolbar. Browse any of the supported platforms and leads will accumulate in the popup automatically.

## Icons

Placeholder icons are needed at:
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`

Generate these from the TaskCoop logo before publishing to the Chrome Web Store.

## Supported platforms

| Platform | Pages scraped |
|---|---|
| Nextdoor | All feed pages |
| Facebook | Group pages only (`/groups/*`) |
| Craigslist | Search results and individual listings |
| Reddit | New Reddit and old.reddit.com |

## How leads are scored

Each post is scored by counting how many task-related keywords appear in the title and body. Posts with a score of zero are ignored. Keywords are defined in `content/common.js` and can be extended without touching any other file.

## Publishing to Chrome Web Store

1. Zip the contents of this directory (not the directory itself)
2. Go to the Chrome Developer Dashboard
3. Upload the zip and complete the listing
