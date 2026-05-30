# Nextdoor + TaskCoop Strategy

## The core idea

Nextdoor is full of people posting task requests ("anyone know a good handyman?", "need help moving this weekend"). TaskCoop can surface those posts to helpers inside the app, giving helpers a place to find work and giving TaskCoop a bootstrapping mechanism for demand.

## The incentive problem (and answer)

The key question: why would a helper route a Nextdoor job through TaskCoop instead of just replying directly?

- **Guaranteed payment** — funds held in escrow before they show up. No chasing cash.
- **They win the job** — a verified ID + clear price + escrow beats a "DM me" reply every time.
- **Reviews that compound** — every job builds a reputation that makes the next one easier to land.
- **Professional pitch** — TaskCoop generates a pre-written reply they paste to Nextdoor.

The reply looks like this:

> "Book me: taskcoop.org/tasks/[id]. I'm [bio excerpt] and I'll do it for $[amount]. Payment is escrowed until you mark the job complete. My ID is verified by TaskCoop."

This is transparent (no ghost intermediary), trustworthy, and gives the OP a direct reason to use TaskCoop.

## Official Nextdoor API

Nextdoor has a Displaying Content API program that requires access approval. Key endpoints:

- **Search API** — query public posts, marketplace listings, and events by lat/long, radius, category, and keywords. Returns posts from the last 30 days with title, description, photos, reaction/comment counts, neighborhood name. This is the primary one we need.
- **Trending Posts API** — top 100 most engaging posts by city, filterable by category and metrics.
- **Public Agency Feed API** — posts from verified public agencies.

Access must be requested at developer.nextdoor.com.

## What was built

### Schema changes (supabase/schema.sql + migration)

- `tasks.customer_id` and `tasks.category_id` made nullable — sourced tasks start without a registered customer
- New columns on `tasks`: `source` (default 'direct'), `external_id`, `external_url`, `claim_token`
- New RLS policies:
  - Workers can insert sourced tasks with null customer_id when source='nextdoor'
  - Any signed-in user can claim an unclaimed sourced task
  - Offers on unclaimed sourced tasks are publicly readable (for the OP landing page)

### /nextdoor page (src/app/nextdoor/page.tsx)

Worker-only. Contains:

1. **How it works explainer** — 4 numbered steps with the worker's actual bio pre-filled in a sample reply, plus three reasons to route through TaskCoop (payment protection, winning the job, compounding reviews)
2. **Mock feed** — 5 realistic local task posts labeled "sample posts, live feed coming soon" — same data structure as the real API response so swapping in live data is a one-liner
3. **Per-post offer form** — worker sets a price, submits, gets a ready-to-copy reply script

### createSourcedTask action (src/app/nextdoor/actions.ts)

- Creates a task stub with customer_id=null and source='nextdoor'
- Creates the worker's offer
- Handles duplicate detection (same worker + same external post)
- Returns taskId to the client component

### Offer form (src/app/nextdoor/offer-form.tsx)

Client component. Three states:
1. Collapsed "Offer to help" button
2. Open form (price + optional note)
3. Reply script with one-click copy + "Open post on Nextdoor" link

### Task page claim flow (src/app/tasks/[id]/page.tsx)

When the OP clicks the TaskCoop link from Nextdoor:
- URL contains `?claim=[token]`
- Token validated server-side via admin client (never exposed to browser)
- Signed-in users see "Claim this task" button
- Visitors see signup / login CTAs with the claim token preserved in the redirect
- After claiming, customer_id is set and the normal offer acceptance + Stripe escrow flow takes over

### Admin client (src/lib/supabase/admin.ts)

Service role client for server-side operations that need to bypass RLS (claim token validation).

### Nav

"Nextdoor Feed" link added for workers in desktop and mobile nav.

## Scraping vs. official API

Scraping Nextdoor is not worth it for this use case:

- Most content is behind a login wall, requiring real accounts and Playwright/Puppeteer with credentials
- Violates ToS, creates legal risk
- Actively submitting an API application — scraping activity from the same domain could kill that
- Brittle: any frontend change breaks it with no warning

## Browser extension idea

A browser extension (user-initiated, reads the user's own feeds) sidesteps the legal problem. The user is reading their own Nextdoor/Facebook/Craigslist/Reddit feed — the extension just aggregates it.

Extended to multiple platforms this becomes a standalone lead aggregation product for local service providers: one feed pulling relevant posts from Nextdoor, Facebook Groups, Craigslist, and Reddit instead of monitoring four tabs manually.

No direct competitor does this. Adjacent players (Thumbtack, Angi, Bark) are closed marketplaces that charge per lead. Contractors already pay $30-80/lead on Angi — a flat monthly subscription for a multi-platform feed would be a better deal.

### Fit within TaskCoop

The tool fits within TaskCoop's cooperative identity if access is gated to companies with employee ownership or profit sharing. This:
- Keeps the brand coherent (cooperative values, not just any contractor)
- Creates a real incentive for small local businesses to adopt worker-ownership structures
- Fills a gap — most cooperative infrastructure is built for solo workers, not small teams with shared ownership
- Gives customers a way to make values-aligned hiring decisions

## .coop TLD justification

Key points for the .coop registry:

TaskCoop is worker-owned and governed by its members. Beyond individual workers, it is building tools specifically for small local businesses that practice profit sharing, employee ownership, or worker governance. Certified cooperative employers get access to lead generation tools and a visible certification on their profile that customers actively choose. The .coop domain is part of how that trust is communicated. The platform uses its position not just to identify itself as a cooperative but to bring more businesses into the cooperative economy.

## Texas cooperative / NPO status

Resources from Taylor Knickel, Texas Center for Employee Ownership:

**Do first**
- Annelies Lottman (direct intro via Taylor) — worker co-op developer, knows Texas-specific legal path
- UTSA SBDC / Isa Fernandez — free advising from someone already familiar with worker co-ops, will help with financials needed for filing

**Do soon**
- Start.coop — structured programs for early-stage worker co-ops, RMEOC partnership relevant for legal structure
- Austin Cooperative Business Association — local community, potential early users and advocates

**Good to know, not urgent**
- DAWI — reference material, more relevant once structure is further along
- Seed Commons — cooperative lending network, relevant when capital is needed on cooperative-friendly terms

**Skip for now**
- SPARK and SCORE — generic small business resources, co-op-specific contacts on this list are better

Respond to Taylor immediately about intros to Annelies and Isa.
