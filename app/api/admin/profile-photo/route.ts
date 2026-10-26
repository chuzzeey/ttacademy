import { NextRequest, NextResponse } from "next/server"
import { ADMIN_EMAIL } from "@/lib/supabase/admin-access"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const BUCKET = "admin-avatars"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    if (!isAdmin) {
      const { data: profile, error: profileError } = await authClient
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Admin profile photo authorization failed:", profileError)
        return NextResponse.json({ error: "Unable to verify admin access" }, { status: 500 })
      }
      isAdmin = Boolean(profile)
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const contentLength = Number(request.headers.get("content-length") || 0)
    if (contentLength > MAX_FILE_SIZE + 64 * 1024) {
      return NextResponse.json({ error: "Choose an image that is 5 MB or smaller." }, { status: 413 })
    }

    const formData = await request.formData()
    const file = formData.get("photo")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a profile photo to upload." }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Choose a JPG, PNG, or WebP image." }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Choose an image that is 5 MB or smaller." }, { status: 413 })
    }

    const adminClient = await createAdminClient()
    const storage = adminClient.storage
    const path = `${user.id}/profile-${Date.now()}.${file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]}`
    const { error: uploadError } = await storage.from(BUCKET).upload(
      path,
      new Uint8Array(await file.arrayBuffer()),
      { cacheControl: "3600", contentType: file.type, upsert: false },
    )
    if (uploadError) {
      console.error("Admin avatar upload failed:", uploadError)
      if (/bucket not found|does not exist/i.test(uploadError.message)) {
        return NextResponse.json({
          error: "Profile photo storage is not set up. Apply migration 20261026160000_admin_avatar_storage.sql, then try again.",
        }, { status: 503 })
      }
      return NextResponse.json({ error: "Unable to upload profile photo" }, { status: 500 })
    }

    const { data: publicUrl } = storage.from(BUCKET).getPublicUrl(path)
    const { error: metadataError } = await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, avatar_url: publicUrl.publicUrl },
    })
    if (metadataError) {
      console.error("Admin avatar profile update failed:", metadataError)
      const { error: cleanupError } = await storage.from(BUCKET).remove([path])
      if (cleanupError) console.error("Unable to clean up unlinked admin avatar:", cleanupError)
      return NextResponse.json({ error: "Photo uploaded, but the administrator profile could not be updated" }, { status: 500 })
    }

    return NextResponse.json(
      { avatarUrl: publicUrl.publicUrl },
      { headers: { "Cache-Control": "private, no-store" } },
    )
  } catch (error) {
    console.error("Admin profile photo request failed:", error)
    return NextResponse.json({ error: "Unable to update profile photo" }, { status: 500 })
  }
}
