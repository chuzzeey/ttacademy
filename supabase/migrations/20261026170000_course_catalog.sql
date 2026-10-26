BEGIN;

INSERT INTO public.classroom_courses (slug, title, is_active) VALUES
  ('ai-automation', 'AI Automation', TRUE),
  ('cybersecurity', 'Cybersecurity', TRUE),
  ('ethical-hacking', 'Ethical Hacking', TRUE),
  ('ai-agent-development', 'AI Agent Development', TRUE),
  ('web-development', 'Web Development', TRUE),
  ('backend-development', 'Backend Development', TRUE),
  ('frontend-development', 'Frontend Development', TRUE),
  ('data-analysis', 'Data Analytics', TRUE),
  ('graphic-design-branding', 'Graphic Design / Branding', TRUE),
  ('uiux-design', 'UI/UX Design', TRUE),
  ('cloud-computing', 'Cloud Computing', TRUE),
  ('ai-video-creation', 'AI Video Editing', TRUE)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    is_active = TRUE;

COMMIT;
