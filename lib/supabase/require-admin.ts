import { NextResponse } from "next/server"
import { ADMIN_EMAIL } from "@/lib/supabase/admin-access"
import { createClient } from "@/lib/supabase/server"

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) }
  }

  if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return { user }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("Admin access lookup failed:", profileError)
    return { response: NextResponse.json({ error: "Unable to verify admin access" }, { status: 500 }) }
  }
  if (!profile) {
    return { response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }
  return { user }
}
