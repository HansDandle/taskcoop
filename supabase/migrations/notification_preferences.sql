-- Notification preferences per user
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  -- Email channel
  email_new_offer BOOLEAN NOT NULL DEFAULT true,
  email_offer_accepted BOOLEAN NOT NULL DEFAULT true,
  email_offer_rejected BOOLEAN NOT NULL DEFAULT true,
  email_new_message BOOLEAN NOT NULL DEFAULT true,
  email_job_marked_done BOOLEAN NOT NULL DEFAULT true,
  email_payment_released BOOLEAN NOT NULL DEFAULT true,
  email_review_received BOOLEAN NOT NULL DEFAULT true,

  -- Push channel (defaults reflect "high-signal only on")
  push_new_offer BOOLEAN NOT NULL DEFAULT true,
  push_offer_accepted BOOLEAN NOT NULL DEFAULT true,
  push_offer_rejected BOOLEAN NOT NULL DEFAULT false,
  push_new_message BOOLEAN NOT NULL DEFAULT true,
  push_job_marked_done BOOLEAN NOT NULL DEFAULT true,
  push_payment_released BOOLEAN NOT NULL DEFAULT false,
  push_review_received BOOLEAN NOT NULL DEFAULT false,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own prefs"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own prefs"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own prefs"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);
