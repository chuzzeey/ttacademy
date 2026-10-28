BEGIN;
CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  banner_headline TEXT,
  banner_subtitle TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS banner_headline TEXT,
  ADD COLUMN IF NOT EXISTS banner_subtitle TEXT;
ALTER TABLE public.email_delivery_logs ADD COLUMN IF NOT EXISTS body_html TEXT;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;
COMMIT;
