import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"

export async function GET() {
  const access = await requireAdmin()
  if (access.response) return access.response

  const supabase = await createAdminClient()
  const { data, error } = await supabase.rpc("admin_unread_payment_proof_count", {
    p_admin_user_id: access.user.id,
  })
  if (error) {
    console.error("Unread payment proof count query failed:", error)
    return NextResponse.json({ error: "Unable to load payment proof notifications." }, { status: 500 })
  }
  return NextResponse.json({ unreadCount: Number(data) || 0 }, { headers: { "Cache-Control": "private, no-store" } })
}

export async function POST() {
  const access = await requireAdmin()
  if (access.response) return access.response

  const supabase = await createAdminClient()
  const { data, error } = await supabase.rpc("mark_admin_payment_proofs_read", {
    p_admin_user_id: access.user.id,
  })
  if (error) {
    console.error("Payment proof notification read update failed:", error)
    return NextResponse.json({ error: "Unable to mark payment proof notifications as seen." }, { status: 500 })
  }
  return NextResponse.json({ markedRead: Number(data) || 0, unreadCount: 0 })
}
