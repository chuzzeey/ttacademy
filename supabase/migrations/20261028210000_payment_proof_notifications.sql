BEGIN;

ALTER TABLE public.payment_proofs
  ADD COLUMN IF NOT EXISTS notification_status TEXT NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS notification_template_id TEXT,
  ADD COLUMN IF NOT EXISTS notification_subject TEXT,
  ADD COLUMN IF NOT EXISTS notification_error TEXT,
  ADD COLUMN IF NOT EXISTS notification_attempted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

WITH previous_payment_proof_emails AS (
  SELECT DISTINCT ON (proof.id)
    proof.id AS proof_id,
    log.template_id,
    log.subject,
    log.status,
    log.error_message,
    log.created_at,
    log.sent_at
  FROM public.payment_proofs AS proof
  JOIN public.email_delivery_logs AS log
    ON log.recipient_student_id = proof.student_id
   AND log.student_code = proof.student_code
   AND log.created_at >= proof.created_at
   AND log.template_id = CASE
     WHEN proof.status = 'approved' THEN 'payment-confirmation'
     WHEN proof.status = 'rejected' THEN 'payment-proof-rejection'
     ELSE NULL
   END
  WHERE proof.notification_status = 'not_sent'
    AND proof.status IN ('approved', 'rejected')
  ORDER BY proof.id, log.created_at DESC
)
UPDATE public.payment_proofs AS proof
SET notification_status = CASE WHEN previous.status = 'sent' THEN 'sent' ELSE 'failed' END,
    notification_template_id = previous.template_id,
    notification_subject = previous.subject,
    notification_error = previous.error_message,
    notification_attempted_at = previous.created_at,
    notification_sent_at = previous.sent_at
FROM previous_payment_proof_emails AS previous
WHERE proof.id = previous.proof_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.payment_proofs'::regclass
      AND conname = 'payment_proofs_notification_status_check'
  ) THEN
    ALTER TABLE public.payment_proofs
      ADD CONSTRAINT payment_proofs_notification_status_check
      CHECK (notification_status IN ('not_sent', 'sent', 'failed'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payment_proof_notification_reads (
  proof_id UUID NOT NULL REFERENCES public.payment_proofs (id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (proof_id, admin_user_id)
);

ALTER TABLE public.payment_proof_notification_reads ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_unread_payment_proof_count(p_admin_user_id UUID)
RETURNS BIGINT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.payment_proofs AS proof
  WHERE proof.status = 'pending'
    AND NOT EXISTS (
      SELECT 1
      FROM public.payment_proof_notification_reads AS seen
      WHERE seen.proof_id = proof.id
        AND seen.admin_user_id = p_admin_user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.mark_admin_payment_proofs_read(p_admin_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  marked_count INTEGER;
BEGIN
  INSERT INTO public.payment_proof_notification_reads (proof_id, admin_user_id)
  SELECT proof.id, p_admin_user_id
  FROM public.payment_proofs AS proof
  WHERE proof.status = 'pending'
  ON CONFLICT (proof_id, admin_user_id) DO NOTHING;

  GET DIAGNOSTICS marked_count = ROW_COUNT;
  RETURN marked_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_payment_proof_review(
  p_proof_id UUID,
  p_action TEXT,
  p_reason TEXT,
  p_reviewed_by UUID,
  p_notification_status TEXT,
  p_notification_template_id TEXT,
  p_notification_subject TEXT,
  p_notification_error TEXT,
  p_notification_sent_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  reviewed_student_id UUID;
BEGIN
  IF p_action NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid payment proof review action';
  END IF;
  IF p_notification_status NOT IN ('sent', 'failed') THEN
    RAISE EXCEPTION 'Invalid payment proof notification status';
  END IF;

  SELECT student_id
  INTO reviewed_student_id
  FROM public.payment_proofs
  WHERE id = p_proof_id AND status = 'processing'
  FOR UPDATE;

  IF reviewed_student_id IS NULL THEN
    RAISE EXCEPTION 'Payment proof is not currently being reviewed';
  END IF;

  IF p_action = 'approved' THEN
    UPDATE public.students
    SET payment_status = 'Fully Paid',
        payment_plan = 'Fully Paid'
    WHERE id = reviewed_student_id;
  END IF;

  UPDATE public.payment_proofs
  SET status = p_action,
      rejection_reason = CASE WHEN p_action = 'rejected' THEN p_reason ELSE NULL END,
      reviewed_by = p_reviewed_by,
      reviewed_at = NOW(),
      notification_status = p_notification_status,
      notification_template_id = p_notification_template_id,
      notification_subject = p_notification_subject,
      notification_error = p_notification_error,
      notification_attempted_at = NOW(),
      notification_sent_at = p_notification_sent_at
  WHERE id = p_proof_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_payment_proof_review(UUID, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_payment_proof_review(UUID, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_payment_proof_review(UUID, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_unread_payment_proof_count(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_admin_payment_proofs_read(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unread_payment_proof_count(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_admin_payment_proofs_read(UUID) TO service_role;

DROP FUNCTION IF EXISTS public.finalize_payment_proof_review(UUID, TEXT, TEXT, UUID);

DROP POLICY IF EXISTS "Admins receive payment proof realtime updates" ON public.payment_proofs;
CREATE POLICY "Admins receive payment proof realtime updates"
  ON public.payment_proofs
  FOR SELECT
  TO authenticated
  USING (
    LOWER(auth.jwt() ->> 'email') = 'adminb@atomic.io'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'payment_proofs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_proofs;
  END IF;
END $$;

COMMIT;
