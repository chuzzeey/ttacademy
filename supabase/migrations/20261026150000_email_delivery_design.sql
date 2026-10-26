BEGIN;

ALTER TABLE public.email_delivery_logs
  ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_headline TEXT,
  ADD COLUMN IF NOT EXISTS banner_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS banner_style_id TEXT NOT NULL DEFAULT 'academy-green';

COMMIT;
