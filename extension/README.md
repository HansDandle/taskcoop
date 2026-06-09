# TaskCoop Lead Finder — Browser Extension

Aggregates task-related posts from Nextdoor, Facebook Groups, Craigslist, and Reddit into a single feed. Works entirely client-side — no data leaves your browser except to open task.coop when you click "Offer to help."

## Installing in Chrome (or Edge / Brave)

1. Go to the [Releases page](https://github.com/HansDandle/taskcoop/releases) and download the latest `lead-finder.zip`. Unzip it somewhere permanent — your Desktop is fine, but don't delete it after installing.
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the unzipped `lead-finder/` folder.
6. The TaskCoop icon will appear in your toolbar. You may need to click the puzzle-piece icon and pin it.

> Edge: go to `edge://extensions` and follow the same steps. Enable **Developer mode** in the left sidebar.
> Brave: go to `brave://extensions` and follow the same steps.

## Installing in Firefox

1. Download and unzip `lead-finder.zip` from the [Releases page](https://github.com/HansDandle/taskcoop/releases).
2. Open Firefox and go to `about:debugging`
3. Click **This Firefox** in the left sidebar.
4. Click **Load Temporary Add-on**.
5. Open the unzipped `lead-finder/` folder and select `manifest.json`.
6. The TaskCoop icon will appear in your toolbar.

**Note:** Firefox's "temporary" add-on is removed when you quit the browser. To keep it across restarts, you need a Firefox account with developer access, or wait for the AMO (addons.mozilla.org) listing.

## Supported platforms

| Platform | Pages scraped |
|---|---|
| Nextdoor | All feed pages |
| Facebook | Group pages only (`/groups/*`) |
| Craigslist | Search results and individual listings |
| Reddit | New Reddit and old.reddit.com |

## How leads are scored

Each post is scored by counting how many task-related keywords appear in the title and body. Posts with a score of zero are ignored. Keywords are defined in `content/common.js` and can be extended without touching any other file.

## How to use it

1. Install the extension using the steps above.
2. Browse Nextdoor, Facebook Groups, Craigslist, or Reddit as you normally would.
3. The extension reads your feed as it loads. The toolbar icon shows a count of new leads.
4. Click the toolbar icon to open the lead popup.
5. Click **Offer to help** on any lead. TaskCoop opens with the post pre-filled.
6. Set your price, generate your reply, and paste it back on the original platform.

## Creating a release (do this before publishing)

1. Zip the extension folder: `cd extension && zip -r ../lead-finder.zip .`
2. On GitHub, go to **Releases → Draft a new release**, tag it (e.g. `ext-v0.1.0`), and attach `lead-finder.zip`. This is what the install instructions above link to.

## Publishing to the Chrome Web Store

1. Use the same `lead-finder.zip` from the release step above.
2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Upload the zip and complete the listing.

## Publishing to Firefox Add-ons (AMO)

1. Go to [addons.mozilla.org/developers](https://addons.mozilla.org/developers/).
2. Submit `lead-finder.zip`. AMO requires source code review for extensions with remote-hosted scripts — this extension has none, so review is typically fast.
