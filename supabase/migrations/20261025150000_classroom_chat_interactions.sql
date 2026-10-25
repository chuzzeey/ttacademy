BEGIN;

ALTER TABLE public.classroom_messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id UUID
    REFERENCES public.classroom_messages (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.validate_classroom_message_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  parent_course_slug TEXT;
BEGIN
  IF NEW.reply_to_message_id IS NOT NULL THEN
    SELECT course_slug
      INTO parent_course_slug
      FROM public.classroom_messages
      WHERE id = NEW.reply_to_message_id;
    IF parent_course_slug IS DISTINCT FROM NEW.course_slug THEN
      RAISE EXCEPTION 'Reply target must belong to the same classroom.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_classroom_message_reply ON public.classroom_messages;
CREATE TRIGGER validate_classroom_message_reply
  BEFORE INSERT OR UPDATE OF reply_to_message_id, course_slug
  ON public.classroom_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_classroom_message_reply();

REVOKE ALL ON FUNCTION public.validate_classroom_message_reply() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.classroom_message_reactions (
  message_id UUID NOT NULL REFERENCES public.classroom_messages (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🔥', '🎉', '💯')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE public.classroom_message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Class members read classroom message reactions" ON public.classroom_message_reactions;
CREATE POLICY "Class members read classroom message reactions"
  ON public.classroom_message_reactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.classroom_messages AS message
      WHERE message.id = message_id
        AND public.can_access_classroom(message.course_slug)
    )
  );

DROP POLICY IF EXISTS "Class members add their own classroom message reactions" ON public.classroom_message_reactions;
CREATE POLICY "Class members add their own classroom message reactions"
  ON public.classroom_message_reactions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.classroom_messages AS message
      WHERE message.id = message_id
        AND public.can_access_classroom(message.course_slug)
    )
  );

DROP POLICY IF EXISTS "Members update their own classroom message reactions" ON public.classroom_message_reactions;
CREATE POLICY "Members update their own classroom message reactions"
  ON public.classroom_message_reactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.classroom_messages AS message
      WHERE message.id = message_id
        AND public.can_access_classroom(message.course_slug)
    )
  );

DROP POLICY IF EXISTS "Members remove their own classroom message reactions" ON public.classroom_message_reactions;
CREATE POLICY "Members remove their own classroom message reactions"
  ON public.classroom_message_reactions FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.classroom_messages AS message
      WHERE message.id = message_id
        AND public.can_access_classroom(message.course_slug)
    )
  );

DROP POLICY IF EXISTS "Members edit their own classroom messages" ON public.classroom_messages;
CREATE POLICY "Members edit their own classroom messages"
  ON public.classroom_messages FOR UPDATE TO authenticated
  USING (
    sender_user_id = auth.uid()
    AND public.can_access_classroom(course_slug)
  )
  WITH CHECK (
    sender_user_id = auth.uid()
    AND public.can_access_classroom(course_slug)
  );

GRANT UPDATE (content, edited_at) ON public.classroom_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE (emoji), DELETE ON public.classroom_message_reactions TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'classroom_message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_message_reactions;
  END IF;
END $$;

COMMIT;
