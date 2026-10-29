import { createClient } from '@supabase/supabase-js'
import { loadServerEnvironment } from './load-server-env'

export async function createAdminClient() {
  loadServerEnvironment()
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase server configuration is missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
