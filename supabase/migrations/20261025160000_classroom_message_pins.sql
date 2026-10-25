BEGIN;

ALTER TABLE public.classroom_messages
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.classroom_messages
  ADD CONSTRAINT classroom_messages_pin_metadata_check
  CHECK (
    (is_pinned AND pinned_at IS NOT NULL)
    OR (NOT is_pinned AND pinned_at IS NULL AND pinned_by IS NULL)
  );

DROP POLICY IF EXISTS "Classroom staff pin messages" ON public.classroom_messages;
CREATE POLICY "Classroom staff pin messages"
  ON public.classroom_messages FOR UPDATE TO authenticated
  USING (
    public.classroom_user_role(course_slug) IN ('admin', 'teacher')
    AND public.can_access_classroom(course_slug)
  )
  WITH CHECK (
    public.classroom_user_role(course_slug) IN ('admin', 'teacher')
    AND public.can_access_classroom(course_slug)
    AND (
      (is_pinned AND pinned_at IS NOT NULL AND (pinned_by IS NULL OR pinned_by = auth.uid()))
      OR (NOT is_pinned AND pinned_at IS NULL AND pinned_by IS NULL)
    )
  );

GRANT UPDATE (is_pinned, pinned_at, pinned_by) ON public.classroom_messages TO authenticated;

COMMIT;
