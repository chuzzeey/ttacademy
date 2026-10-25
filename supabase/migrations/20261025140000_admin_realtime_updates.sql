BEGIN;

DROP POLICY IF EXISTS "Admins receive classroom management updates on rooms" ON public.classroom_rooms;
CREATE POLICY "Admins receive classroom management updates on rooms"
  ON public.classroom_rooms
  FOR SELECT
  TO authenticated
  USING (
    LOWER(auth.jwt() ->> 'email') = 'adminb@atomic.io'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins receive classroom management updates on teachers" ON public.classroom_teachers;
CREATE POLICY "Admins receive classroom management updates on teachers"
  ON public.classroom_teachers
  FOR SELECT
  TO authenticated
  USING (
    LOWER(auth.jwt() ->> 'email') = 'adminb@atomic.io'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins receive classroom management updates on students" ON public.classroom_students;
CREATE POLICY "Admins receive classroom management updates on students"
  ON public.classroom_students
  FOR SELECT
  TO authenticated
  USING (
    LOWER(auth.jwt() ->> 'email') = 'adminb@atomic.io'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins receive student updates" ON public.students;
CREATE POLICY "Admins receive student updates"
  ON public.students
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
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'classroom_courses',
    'classroom_rooms',
    'classroom_teachers',
    'classroom_students',
    'students'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END $$;

COMMIT;
