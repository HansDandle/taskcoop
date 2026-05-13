-- Expanded ID verification + new categories
-- Run this in Supabase SQL editor.

-- 1. Seed new task categories. ON CONFLICT keeps re-runs safe.
INSERT INTO public.categories (name, slug, description) VALUES
  ('Pets', 'pets', 'Pet grooming, boarding, sitting, and walking'),
  ('Notary / Process Server', 'notary-process-server', 'Mobile notary services and process serving')
ON CONFLICT (slug) DO NOTHING;

-- 2. Add columns for the expanded ID-verification flow.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS id_selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS professional_licenses JSONB NOT NULL DEFAULT '[]'::jsonb;

-- professional_licenses shape:
--   [ { "title": "Notary Commission", "path": "<uuid>/license/...jpg", "approved": false } ]
-- "title" is shown on the worker's public profile once "approved" is true.
-- "path" points into the private id-documents bucket; only admins can read it.

-- 3. Backfill prompt: workers verified before the selfie/license flow shipped should
--    be nudged on next login. We flip their status back to NULL so the profile page
--    re-renders the upload UI without revoking the existing verified badge.
--    (id_verified stays true; id_verification_status null + no selfie = "needs update".)
--    Uncomment when you're ready to send the nudge — leaving it commented for a phased
--    rollout. The dashboard banner already triggers off (id_verified AND id_selfie_url IS NULL).

-- UPDATE public.users
--   SET id_verification_status = NULL
--   WHERE role = 'worker' AND id_verified = true AND id_selfie_url IS NULL;
