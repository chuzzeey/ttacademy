import { NextRequest, NextResponse } from "next/server"
import { ADMIN_EMAIL } from "@/lib/supabase/admin-access"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const periods = new Set(["7d", "30d", "90d", "12m", "all"])

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") || "30d"
  if (!periods.has(period)) {
    return NextResponse.json({ error: "Invalid analytics period" }, { status: 400 })
  }

  try {
    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL
    if (!isAdmin) {
      const { data: profile, error: profileError } = await authClient
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Admin analytics authorization failed:", profileError)
        return NextResponse.json(
          { error: "Unable to verify admin access" },
          { status: 500 },
        )
      }
      isAdmin = Boolean(profile)
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const adminClient = await createAdminClient()
    const { data, error } = await adminClient.rpc("admin_dashboard_analytics", {
      p_period: period,
    })

    if (error) {
      console.error("Admin analytics query failed:", error)
      return NextResponse.json(
        { error: "Unable to load dashboard analytics" },
        { status: 500 },
      )
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch (error) {
    console.error("Admin analytics request failed:", error)
    return NextResponse.json(
      { error: "Unable to load dashboard analytics" },
      { status: 500 },
    )
  }
}
