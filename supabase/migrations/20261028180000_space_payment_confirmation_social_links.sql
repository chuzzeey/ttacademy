BEGIN;

UPDATE public.email_templates
SET body_html = replace(
  body_html,
  '<p>Follow us on Instagram: <a href="https://www.instagram.com/techtrailblazeracademy?mdxt=MXg5dWkydmo4cXJ6&amp;utm_source=qr">Tech Trailblazer Academy on Instagram</a><br>
Follow us on TikTok: <a href="https://www.tiktok.com/@techacademy4all?_r=1&amp;_t=ZS-9AsoRfOnEXv">Tech Trailblazer Academy on TikTok</a><br>
Follow us on X: <a href="https://x.com/techacademy4all?s=11">Tech Trailblazer Academy on X</a><br>
Follow us on Facebook: <a href="https://www.facebook.com/share/1BJMaL2UzV/?mibextid=wwXIfr">Tech Trailblazer Academy on Facebook</a></p>',
  '<p>Follow us:</p>{{social_links}}'
)
WHERE id = 'payment-confirmation'
  AND body_html LIKE '%Follow us on Instagram:%';

COMMIT;
