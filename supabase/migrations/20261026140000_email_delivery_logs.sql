BEGIN;

CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_student_id UUID REFERENCES public.students (id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  student_code TEXT NOT NULL,
  template_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  smtp_message_id TEXT,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_delivery_logs_created_at_idx
  ON public.email_delivery_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS email_delivery_logs_status_created_at_idx
  ON public.email_delivery_logs (status, created_at DESC);

ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;

COMMIT;
