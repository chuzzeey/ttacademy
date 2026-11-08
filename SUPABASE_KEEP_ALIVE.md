# Supabase keep-alive

The `Supabase keep-alive` GitHub Actions workflow requests the Supabase REST
API once per day and can also be started manually from the repository's
**Actions** tab. This periodically exercises the project API; it does not
change the Supabase plan or guarantee uptime if GitHub Actions is disabled or
the project has another issue.

The workflow reads these repository Actions secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the legacy anon key or the current publishable key)

They should match the application's Supabase project. Never add key values to
the workflow file or commit them to the repository. The publishable key is
sent only as the `apikey` header; do not use a secret or service-role key.
