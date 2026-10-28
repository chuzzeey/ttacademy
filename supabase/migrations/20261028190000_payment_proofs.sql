BEGIN;

CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  student_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  course TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif')),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 15728640),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_proofs_created_at_idx
  ON public.payment_proofs (created_at DESC);
CREATE INDEX IF NOT EXISTS payment_proofs_student_code_idx
  ON public.payment_proofs (student_code);
CREATE UNIQUE INDEX IF NOT EXISTS payment_proofs_one_open_per_student_idx
  ON public.payment_proofs (student_id)
  WHERE status IN ('pending', 'processing');

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  FALSE,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE OR REPLACE FUNCTION public.finalize_payment_proof_review(
  p_proof_id UUID,
  p_action TEXT,
  p_reason TEXT,
  p_reviewed_by UUID
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
      reviewed_at = NOW()
  WHERE id = p_proof_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_payment_proof_review(UUID, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_payment_proof_review(UUID, TEXT, TEXT, UUID) TO service_role;

COMMIT;
