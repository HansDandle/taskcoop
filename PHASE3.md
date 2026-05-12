# Phase 3 — Money-flow hardening

Two changes that go together. Do on a feature branch, test end-to-end in Stripe test mode, ship alone (no other refactors riding along).

## Goal

Make the offer-acceptance → payment flow correct under (a) Stripe webhook re-delivery and (b) customers abandoning Checkout after clicking Accept.

## Problem 1 — Webhook is not idempotent

`src/app/api/stripe/webhook/route.ts`. Stripe re-delivers events on retry (network blip, our 500, etc.). The current handler will:

- On duplicate `checkout.session.completed`: re-run the UPDATE. Fields are the same EXCEPT `funds_release_at`, which slides forward by 5 days every time the event is processed. A handful of retries could push the auto-release indefinitely.
- On duplicate `account.updated`: idempotent in practice (sets the same boolean).

### Fix

Add a `stripe_events` table:

```sql
create table stripe_events (
  id text primary key,           -- event.id from Stripe
  type text not null,
  received_at timestamptz not null default now()
);
```

In the webhook, before any side effect:

```ts
const { error: insertErr } = await supabase
  .from('stripe_events')
  .insert({ id: event.id, type: event.type })
if (insertErr?.code === '23505') {
  // unique-violation = already processed
  return new Response('ok (duplicate)', { status: 200 })
}
```

If the insert succeeds, proceed with the side effects. Order matters: insert first (so re-delivery short-circuits), side effects second. If a side effect fails after insert, we'll need to manually replay — acceptable trade-off vs. double-applying.

## Problem 2 — `acceptOffer` commits state before payment

`src/app/tasks/[id]/actions.ts:55-145`. Current order:

1. Mark target offer `accepted`
2. Mark sibling offers `rejected`
3. Mark task `assigned`
4. Email/push accepted worker
5. Email/push rejected workers
6. Create Stripe Checkout Session
7. Redirect customer to Checkout

If the customer closes the tab at step 7, all the state from 1–5 is committed but no payment exists. The task is stuck `assigned` with no `payment_intent_id`. Rejected workers got rejection notifications for a deal that never happened.

### Fix — defer commits to the webhook

New flow:

1. Verify ownership, offer existence, task is `open`
2. Create Stripe Checkout Session with metadata `{ task_id, offer_id, worker_id, amount }` and `expires_at = now + 30min`
3. Set on task: `pending_offer_id = offer_id`, `pending_checkout_session_id = session.id` (do NOT change status, do NOT touch offers, do NOT email)
4. Redirect to Checkout

Then in the webhook on `checkout.session.completed`, after the idempotency check:

5. Verify `metadata.task_id` matches a task whose `pending_offer_id == metadata.offer_id` (defends against stale sessions)
6. Mark target offer `accepted`, siblings `rejected`, task `assigned`, set `payment_intent_id`, `payment_status='held'`, `funds_release_at`
7. Clear `pending_offer_id`, `pending_checkout_session_id`
8. Send accepted/rejected emails + pushes

Also handle `checkout.session.expired` (Stripe fires this when the customer abandons): clear `pending_offer_id` and `pending_checkout_session_id` so the customer can retry from the task page.

### UI surface

`src/app/tasks/[id]/page.tsx` and `offer-section.tsx` need a "Resume payment" state when `pending_offer_id` is set: show the pending offer prominently, hide other accept buttons, link to a route that re-creates a Checkout Session for the same offer (or stores the session URL and re-uses it while not expired).

### Schema changes

```sql
alter table tasks
  add column pending_offer_id uuid references offers(id),
  add column pending_checkout_session_id text;
```

### Webhook events to handle

- `checkout.session.completed` — current behavior + new commits described above
- `checkout.session.expired` — new, clears the pending fields
- `account.updated` — unchanged
- (optional) `charge.refunded` — would mark task as cancelled/refunded; out of scope unless refunds happen

## Test plan (Stripe test mode)

End-to-end happy path:
- Customer accepts offer → redirected to Checkout → pays → returns to `/tasks/[id]?payment=success` → task shows `assigned`, offers updated, worker emailed.

Webhook idempotency:
- Trigger `checkout.session.completed` twice via Stripe CLI (`stripe events resend <event_id>`) → second delivery returns 200 with no state change.

Abandoned checkout:
- Customer accepts → redirected → closes tab → wait 30 min (or trigger `checkout.session.expired` via CLI) → task should clear `pending_offer_id`, customer can accept again.

Stale session protection:
- Customer accepts offer A → abandons → customer accepts offer B → pays for B → ensure offer A is NOT marked accepted by a late-arriving webhook for session A.

## Rollback

Both changes are additive (new table, new columns, new event handler). If something breaks, revert the webhook + actions code; the new columns can sit unused. The `stripe_events` table is harmless to leave behind.

## Out of scope for Phase 3

- Refunds and dispute handling
- Partial releases (e.g. split between two workers)
- Tip flow changes — `api/stripe/tip` is a separate code path and doesn't need this treatment yet
- The unsubscribe-secret rotation question (handled in Phase 2)
