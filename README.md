This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Day One Build: 

Here's what was built:

Marketing / public

/ — Landing page with hero, category grid, stats, how-it-works preview, recent tasks
/how-it-works — Step-by-step for customers and workers
/cooperative — Co-op model explanation + governance roadmap
/faq — Collapsible FAQ
/austin — City SEO landing page
/services/[category] — One page per service category (handyman, cleaning, etc.)
/sitemap.xml + /robots.txt
Auth (already existed, improved)

Login/signup redesigned with co-op branding, role card selector, ?next= redirect support
Core marketplace

/tasks — Browse tasks with sidebar filters (category, budget, search)
/tasks/new — Task posting form (Server Action)
/tasks/[id] — Task detail: description, photos, offers list, worker profiles, accept flow
/tasks/[id]/review — Leave a review after completion
Offer/bidding

Workers submit offers inline on the task detail page
Customer accepts → task goes assigned
PayButton → Stripe Checkout for escrowed payment
Messaging

/messages/[taskId] — Real-time-style thread between customer and worker
User pages

/dashboard — Different views for customer (tasks) and worker (offers/earnings)
/profile — Edit name + bio
/workers/[id] — Public worker profile with reviews and star ratings
Payments

/api/stripe/checkout — Creates Checkout Session with platform fee (5%) + destination charge
/api/stripe/connect — Stripe Connect onboarding for workers
/api/stripe/webhook — Updates task status on payment completion (uses service role key to bypass RLS)
Admin

/admin — Stats dashboard + recent users/tasks
/admin/users — Filter/search users, change roles
/admin/tasks — Filter tasks by status
Legal

/terms, /privacy, /worker-classification
To run locally you'll need to fill in .env.local with:

Real Supabase keys (URL + anon key + service role key)
Stripe keys (secret + publishable + webhook secret)
Run supabase/schema.sql against your Supabase project
Set NEXT_PUBLIC_APP_URL for production