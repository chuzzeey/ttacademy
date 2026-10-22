BEGIN;

CREATE TABLE IF NOT EXISTS public.classroom_courses (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.classroom_courses (slug, title) VALUES
  ('cybersecurity', 'Cybersecurity'),
  ('data-science', 'Data Science'),
  ('ai-automation', 'AI Automation'),
  ('computer-networking', 'Computer Networking'),
  ('ethical-hacking', 'Ethical Hacking'),
  ('graphic-design', 'Graphic Design'),
  ('uiux-design', 'UI/UX Design'),
  ('full-stack-development', 'Full Stack Development'),
  ('frontend-development', 'Frontend Development'),
  ('backend-development', 'Backend Development'),
  ('web-development', 'Web Development'),
  ('digital-marketing', 'Digital Marketing'),
  ('cloud-computing', 'Cloud Computing'),
  ('data-analysis', 'Data Analysis')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.classroom_rooms (
  course_slug TEXT PRIMARY KEY REFERENCES public.classroom_courses (slug) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.classroom_rooms (course_slug)
SELECT slug FROM public.classroom_courses
ON CONFLICT (course_slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.classroom_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL REFERENCES public.classroom_courses (slug),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'restricted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_classroom_one_teacher_per_course
  ON public.classroom_teachers (course_slug)
  WHERE status <> 'restricted';

CREATE TABLE IF NOT EXISTS public.classroom_students (
  student_id UUID PRIMARY KEY REFERENCES public.students (id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,
  course_slug TEXT NOT NULL REFERENCES public.classroom_courses (slug),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'restricted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.create_classroom_student_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_slug TEXT;
BEGIN
  SELECT c.slug INTO target_slug
  FROM public.classroom_courses AS c
  WHERE lower(c.title) = lower(trim(NEW.course))
    OR c.slug = trim(both '-' FROM regexp_replace(lower(trim(NEW.course)), '[^a-z0-9]+', '-', 'g'))
  ORDER BY CASE WHEN lower(c.title) = lower(trim(NEW.course)) THEN 0 ELSE 1 END
  LIMIT 1;

  INSERT INTO public.classroom_students (student_id, course_slug, status)
  SELECT NEW.id, c.slug, CASE WHEN COALESCE(NEW.restricted, FALSE) THEN 'restricted' ELSE 'pending' END
  FROM public.classroom_courses AS c
  WHERE c.slug = target_slug
  ON CONFLICT (student_id) DO UPDATE
  SET course_slug = EXCLUDED.course_slug,
      status = CASE WHEN COALESCE(NEW.restricted, FALSE) THEN 'restricted' ELSE 'pending' END,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_create_classroom_access ON public.students;
CREATE TRIGGER students_create_classroom_access
  AFTER INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.create_classroom_student_access();

INSERT INTO public.classroom_students (student_id, course_slug, status)
SELECT
  s.id,
  c.slug,
  CASE WHEN COALESCE(s.restricted, FALSE) THEN 'restricted' ELSE 'pending' END
FROM public.students AS s
JOIN public.classroom_courses AS c
  ON lower(c.title) = lower(trim(s.course))
  OR c.slug = trim(both '-' FROM regexp_replace(lower(trim(s.course)), '[^a-z0-9]+', '-', 'g'))
ON CONFLICT (student_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.classroom_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL REFERENCES public.classroom_courses (slug),
  sender_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'teacher', 'student')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  attachment_path TEXT,
  attachment_name TEXT,
  attachment_mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT classroom_message_has_content_or_attachment
    CHECK (length(trim(content)) > 0 OR attachment_path IS NOT NULL),
  CONSTRAINT classroom_message_attachment_fields
    CHECK (
      (attachment_path IS NULL AND attachment_name IS NULL AND attachment_mime_type IS NULL)
      OR
      (attachment_path IS NOT NULL AND attachment_name IS NOT NULL AND attachment_mime_type IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_classroom_messages_course_created
  ON public.classroom_messages (course_slug, created_at DESC);

CREATE OR REPLACE FUNCTION public.can_access_classroom(p_course_slug TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.admin_profiles AS a
        WHERE a.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.classroom_teachers AS t
        JOIN public.classroom_rooms AS r USING (course_slug)
        WHERE t.user_id = auth.uid()
          AND t.course_slug = p_course_slug
          AND t.status = 'approved'
          AND r.is_locked = FALSE
      )
      OR EXISTS (
        SELECT 1
        FROM public.classroom_students AS cs
        JOIN public.students AS s ON s.id = cs.student_id
        JOIN public.classroom_rooms AS r ON r.course_slug = cs.course_slug
        WHERE cs.auth_user_id = auth.uid()
          AND cs.course_slug = p_course_slug
          AND cs.status = 'approved'
          AND COALESCE(s.restricted, FALSE) = FALSE
          AND lower(COALESCE(s.payment_status, '')) IN ('fully paid', '1st installment', '2nd installment')
          AND r.is_locked = FALSE
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.classroom_user_role(p_course_slug TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()) THEN 'admin'
    WHEN EXISTS (
      SELECT 1 FROM public.classroom_teachers AS t
      JOIN public.classroom_rooms AS r USING (course_slug)
      WHERE t.user_id = auth.uid()
        AND t.course_slug = p_course_slug
        AND t.status = 'approved'
        AND r.is_locked = FALSE
    ) THEN 'teacher'
    WHEN public.can_access_classroom(p_course_slug) THEN 'student'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.classroom_user_name(p_course_slug TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT full_name FROM public.admin_profiles WHERE user_id = auth.uid()),
    (SELECT display_name FROM public.classroom_teachers
      WHERE user_id = auth.uid() AND course_slug = p_course_slug AND status = 'approved'),
    (SELECT s.name FROM public.classroom_students AS cs
      JOIN public.students AS s ON s.id = cs.student_id
      WHERE cs.auth_user_id = auth.uid()
        AND cs.course_slug = p_course_slug
        AND cs.status = 'approved'
        AND COALESCE(s.restricted, FALSE) = FALSE
        AND lower(COALESCE(s.payment_status, '')) IN ('fully paid', '1st installment', '2nd installment')),
    auth.jwt() ->> 'email',
    'Classroom member'
  );
$$;

ALTER TABLE public.classroom_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read active classroom courses" ON public.classroom_courses;
CREATE POLICY "Authenticated users read active classroom courses"
  ON public.classroom_courses FOR SELECT TO authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Class members read their room" ON public.classroom_rooms;
CREATE POLICY "Class members read their room"
  ON public.classroom_rooms FOR SELECT TO authenticated
  USING (public.can_access_classroom(course_slug));

DROP POLICY IF EXISTS "Teachers read their classroom assignment" ON public.classroom_teachers;
CREATE POLICY "Teachers read their classroom assignment"
  ON public.classroom_teachers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Students read their own classroom approval" ON public.classroom_students;
CREATE POLICY "Students read their own classroom approval"
  ON public.classroom_students FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Class members read messages" ON public.classroom_messages;
CREATE POLICY "Class members read messages"
  ON public.classroom_messages FOR SELECT TO authenticated
  USING (public.can_access_classroom(course_slug));

DROP POLICY IF EXISTS "Class members send messages" ON public.classroom_messages;
CREATE POLICY "Class members send messages"
  ON public.classroom_messages FOR INSERT TO authenticated
  WITH CHECK (
    public.can_access_classroom(course_slug)
    AND sender_user_id = auth.uid()
    AND sender_role = public.classroom_user_role(course_slug)
    AND sender_name = public.classroom_user_name(course_slug)
  );

DROP POLICY IF EXISTS "Members delete their own classroom messages" ON public.classroom_messages;
CREATE POLICY "Members delete their own classroom messages"
  ON public.classroom_messages FOR DELETE TO authenticated
  USING (
    sender_user_id = auth.uid()
    AND public.can_access_classroom(course_slug)
  );

GRANT SELECT ON public.classroom_courses, public.classroom_rooms,
  public.classroom_teachers, public.classroom_students TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.classroom_messages TO authenticated;
REVOKE ALL ON FUNCTION public.can_access_classroom(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_classroom(TEXT) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.classroom_user_role(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.classroom_user_role(TEXT) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.classroom_user_name(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.classroom_user_name(TEXT) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_classroom_student_access() FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.classroom_courses, public.classroom_rooms,
  public.classroom_teachers, public.classroom_students, public.classroom_messages TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'classroom-files',
  'classroom-files',
  FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Class members read classroom files" ON storage.objects;
CREATE POLICY "Class members read classroom files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'classroom-files'
    AND public.can_access_classroom(split_part(name, '/', 1))
  );

DROP POLICY IF EXISTS "Class members upload classroom files" ON storage.objects;
CREATE POLICY "Class members upload classroom files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'classroom-files'
    AND split_part(name, '/', 2) = auth.uid()::TEXT
    AND public.can_access_classroom(split_part(name, '/', 1))
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'classroom_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_messages;
  END IF;
END $$;

COMMIT;
