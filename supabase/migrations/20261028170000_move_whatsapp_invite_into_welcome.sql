BEGIN;

UPDATE public.email_templates
SET body_html = replace(
  body_html,
  'We’re excited to welcome you to TECH TRAILBLAZER ACADEMY and support you throughout your learning journey!</p>',
  'We’re excited to welcome you to TECH TRAILBLAZER ACADEMY and support you throughout your learning journey!</p>{{whatsapp_community_link}}'
)
WHERE id = 'welcome'
  AND body_html LIKE '%We’re excited to welcome you to TECH TRAILBLAZER ACADEMY and support you throughout your learning journey!%'
  AND body_html NOT LIKE '%whatsapp_community_link%';

COMMIT;
