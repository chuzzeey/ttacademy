import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const courseSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const pageSize = 500
const storageBatchSize = 100

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    if (typeof body.course !== "string" || !courseSlugPattern.test(body.course)) {
      return NextResponse.json({ error: "A valid classroom is required." }, { status: 400 })
    }

    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    }

    const { data: role, error: roleError } = await authClient.rpc("classroom_user_role", {
      p_course_slug: body.course,
    })
    if (roleError) {
      console.error("Could not verify classroom admin role:", roleError)
      return NextResponse.json({ error: "Unable to verify classroom permissions." }, { status: 500 })
    }
    if (role !== "admin") {
      return NextResponse.json({ error: "Only this classroom's admin can clear its chat." }, { status: 403 })
    }

    const adminClient = await createAdminClient()
    const attachmentPaths: string[] = []
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await adminClient
        .from("classroom_messages")
        .select("id,attachment_path")
        .eq("course_slug", body.course)
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1)
      if (error) throw error
      for (const message of data) {
        if (message.attachment_path) attachmentPaths.push(message.attachment_path)
      }
      if (data.length < pageSize) break
    }

    const { error: deleteError } = await adminClient
      .from("classroom_messages")
      .delete()
      .eq("course_slug", body.course)
    if (deleteError) throw deleteError

    for (let index = 0; index < attachmentPaths.length; index += storageBatchSize) {
      const { error } = await adminClient.storage
        .from("classroom-files")
        .remove(attachmentPaths.slice(index, index + storageBatchSize))
      if (error) {
        console.error("Chat cleared, but classroom attachment cleanup failed:", error)
        return NextResponse.json({
          error: "Chat history was cleared, but some attached files could not be removed from storage.",
        }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Classroom chat cleared successfully." })
  } catch (error) {
    console.error("Clear classroom chat failed:", error)
    return NextResponse.json({ error: "Unable to clear this classroom's chat." }, { status: 500 })
  }
}
