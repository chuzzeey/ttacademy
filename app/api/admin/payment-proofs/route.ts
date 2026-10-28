import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"

export async function GET(request: NextRequest) {
  const access = await requireAdmin()
  if (access.response) return access.response

  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 40) || ""
  const status = request.nextUrl.searchParams.get("status")
  const notificationStatus = request.nextUrl.searchParams.get("notification_status")
  const supabase = await createAdminClient()
  let proofsQuery = supabase
    .from("payment_proofs")
    .select("id,student_id,student_code,student_name,student_email,course,storage_path,mime_type,file_size,status,rejection_reason,reviewed_at,created_at,notification_status,notification_template_id,notification_subject,notification_error,notification_attempted_at,notification_sent_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (query) proofsQuery = proofsQuery.ilike("student_code", `%${query.replace(/[%_]/g, "")}%`)
  if (status && ["pending", "processing", "approved", "rejected"].includes(status)) {
    proofsQuery = proofsQuery.eq("status", status)
  }
  if (notificationStatus && ["not_sent", "sent", "failed"].includes(notificationStatus)) {
    proofsQuery = proofsQuery.eq("notification_status", notificationStatus)
  }

  const { data, error } = await proofsQuery
  if (error) {
    console.error("Payment proof admin list query failed:", error)
    return NextResponse.json({ error: "Unable to load payment proofs. Apply the payment proofs migration and try again." }, { status: 503 })
  }

  const proofs = await Promise.all((data ?? []).map(async (proof) => {
    const { data: signed, error: signedError } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(proof.storage_path, 60 * 10)
    if (signedError) {
      console.error("Payment proof preview URL creation failed:", { proofId: proof.id, error: signedError })
      throw new Error("Unable to create a secure preview for one or more payment proofs.")
    }
    return { ...proof, imageUrl: signed.signedUrl }
  })).catch((error: unknown) => {
    console.error("Payment proof previews could not be prepared:", error)
    return null
  })

  if (!proofs) {
    return NextResponse.json({ error: "Unable to prepare secure payment proof previews." }, { status: 500 })
  }
  return NextResponse.json({ data: proofs }, { headers: { "Cache-Control": "private, no-store" } })
}
