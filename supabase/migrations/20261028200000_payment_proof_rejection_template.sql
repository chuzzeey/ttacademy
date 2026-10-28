BEGIN;

CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  banner_headline TEXT,
  banner_subtitle TEXT,
  updated_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

INSERT INTO public.email_templates (id, name, description, subject, body_html, banner_headline, banner_subtitle)
VALUES (
  'payment-proof-rejection',
  'Payment proof update',
  'Let a learner know their payment proof needs another look.',
  'Action needed: please resubmit your payment proof',
  '<p>Hi {{name}},</p>
<p>Thank you for sending your payment proof for <strong>{{course}}</strong>. We were unable to confirm the payment from the image provided.</p>
<p><strong>Review note:</strong> {{reason}}</p>
<p>Please check that your receipt image is clear and shows the payment details, then submit a new proof from our website. If you believe this was sent in error, reply to this email and our team will be happy to help.</p>
<p>Best regards,<br>Tech Trailblazer Academy Team</p>',
  'Payment proof update',
  'Action needed: please resubmit your payment proof'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
