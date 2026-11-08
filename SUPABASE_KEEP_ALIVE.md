# Supabase keep-alive

The `Supabase keep-alive` GitHub Actions workflow requests the Supabase REST
API once per day and can also be started manually from the repository's
**Actions** tab. This periodically exercises the project API; it does not
change the Supabase plan or guarantee uptime if GitHub Actions is disabled or
the project has another issue.

The workflow reads these repository Actions secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

They should match the application's Supabase URL and public anon key. Never
add secret values to the workflow file or commit them to the repository.
