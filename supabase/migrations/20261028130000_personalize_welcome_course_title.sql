BEGIN;

UPDATE public.email_templates
SET body_html = replace(
  body_html,
  'becoming a UI/UX Designer at',
  'becoming a <strong>{{course}}</strong> at'
)
WHERE id = 'welcome'
  AND body_html LIKE '%becoming a UI/UX Designer at%';

COMMIT;
