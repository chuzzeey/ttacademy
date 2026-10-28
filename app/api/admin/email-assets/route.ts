import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"

const bucket = "email-assets"

export async function POST(request: NextRequest) {
  const access = await requireAdmin()
  if (access.response) return access.response
  const file = (await request.formData()).get("file")
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Choose an image smaller than 5 MB." }, { status: 400 })
  }
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  const path = `${access.user.id}/${crypto.randomUUID()}.${extension}`
  const supabase = await createAdminClient()
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false })
  if (error) {
    console.error("Email image upload failed:", error)
    return NextResponse.json({ error: "Unable to upload image. Create the email-assets storage bucket first." }, { status: 500 })
  }
  return NextResponse.json({ url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl })
}
