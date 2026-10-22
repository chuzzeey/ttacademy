import { randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { requireAdmin } from "@/lib/supabase/require-admin"

const statuses = new Set(["pending", "approved", "restricted"])

export async function GET() {
  try {
    const access = await requireAdmin()
    if (access.response) return access.response

    const supabase = await createAdminClient()
    const [coursesResult, roomsResult, teachersResult, studentsResult] = await Promise.all([
      supabase.from("classroom_courses").select("slug,title,is_active").eq("is_active", true).order("title"),
      supabase.from("classroom_rooms").select("course_slug,is_locked"),
      supabase.from("classroom_teachers").select("id,course_slug,email,display_name,status,created_at").order("created_at", { ascending: false }),
      supabase.from("classroom_students").select("student_id,course_slug,status,student:students(id,name,email,payment_status,restricted,created_at)").order("created_at", { ascending: false }),
    ])

    const failed = [coursesResult, roomsResult, teachersResult, studentsResult].find((result) => result.error)
    if (failed?.error) {
      console.error("Classroom management query failed:", failed.error)
      return NextResponse.json({ error: "Unable to load classroom management data" }, { status: 500 })
    }

    return NextResponse.json({
      courses: coursesResult.data,
      rooms: roomsResult.data,
      teachers: teachersResult.data,
      students: studentsResult.data,
    }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Classroom management request failed:", error)
    return NextResponse.json({ error: "Unable to load classroom management data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdmin()
    if (access.response) return access.response

    const body = await request.json()
    if (body.action === "create-teacher") {
      const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug : ""
      const displayName = typeof body.displayName === "string" ? body.displayName.trim().slice(0, 80) : ""
      if (!courseSlug || !displayName) {
        return NextResponse.json({ error: "Choose a class and enter the teacher’s name." }, { status: 400 })
      }

      const supabase = await createAdminClient()
      const { data: course, error: courseError } = await supabase
        .from("classroom_courses")
        .select("slug")
        .eq("slug", courseSlug)
        .eq("is_active", true)
        .maybeSingle()
      if (courseError || !course) {
        return NextResponse.json({ error: "That class is not available." }, { status: 400 })
      }

      const { data: existingTeacher, error: existingError } = await supabase
        .from("classroom_teachers")
        .select("id")
        .eq("course_slug", courseSlug)
        .neq("status", "restricted")
        .maybeSingle()
      if (existingError) throw existingError
      if (existingTeacher) {
        return NextResponse.json({ error: "This class already has a teacher assignment. Restrict it before assigning another teacher." }, { status: 409 })
      }

      const email = `${courseSlug}.ttacademy@atomic.io`
      const temporaryPassword = `${randomBytes(18).toString("base64url")}!9a`
      const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { name: displayName, role: "teacher", must_change_password: true },
      })
      if (createUserError || !authData.user) {
        console.error("Teacher account creation failed:", createUserError)
        return NextResponse.json({ error: "Unable to create teacher sign-in. Check whether the generated email is already in use." }, { status: 500 })
      }

      const { error: insertError } = await supabase.from("classroom_teachers").insert({
        user_id: authData.user.id,
        course_slug: courseSlug,
        email,
        display_name: displayName,
        status: "pending",
      })
      if (insertError) {
        const { error: cleanupError } = await supabase.auth.admin.deleteUser(authData.user.id)
        if (cleanupError) console.error("Failed to roll back unassigned teacher account:", cleanupError)
        console.error("Teacher assignment creation failed:", insertError)
        return NextResponse.json({ error: "Unable to save teacher assignment." }, { status: 500 })
      }

      return NextResponse.json({
        message: "Teacher account created and awaiting approval. Share the password securely; it will not be shown again.",
        teacher: { email, displayName, courseSlug, status: "pending" },
        temporaryPassword,
      }, { status: 201, headers: { "Cache-Control": "no-store" } })
    }

    if (body.action === "update-status") {
      const { type, id, status } = body
      if (!["teacher", "student"].includes(type) || typeof id !== "string" || !statuses.has(status)) {
        return NextResponse.json({ error: "Invalid classroom status update." }, { status: 400 })
      }

      const supabase = await createAdminClient()
      if (type === "teacher") {
        const { data, error } = await supabase.from("classroom_teachers")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select("id,status")
          .single()
        if (error) {
          console.error("Teacher status update failed:", error)
          return NextResponse.json({ error: "Unable to update teacher access." }, { status: 500 })
        }
        return NextResponse.json({ data })
      }

      const { data: membership, error: membershipError } = await supabase.from("classroom_students")
        .select("student_id")
        .eq("student_id", id)
        .maybeSingle()
      if (membershipError || !membership) {
        return NextResponse.json({ error: "Student classroom record not found." }, { status: 404 })
      }
      if (status === "approved") {
        const { data: student, error: studentError } = await supabase.from("students")
          .select("restricted")
          .eq("id", id)
          .single()
        if (studentError || student?.restricted) {
          return NextResponse.json({ error: "Unrestrict the student account before approving classroom access." }, { status: 409 })
        }
      }
      const { error: statusError } = await supabase.from("classroom_students")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("student_id", id)
      if (statusError) {
        console.error("Student classroom status update failed:", statusError)
        return NextResponse.json({ error: "Unable to update student classroom access." }, { status: 500 })
      }
      if (status === "restricted") {
        const { error: restrictionError } = await supabase.from("students").update({ restricted: true }).eq("id", id)
        if (restrictionError) {
          console.error("Student restriction update failed:", restrictionError)
          return NextResponse.json({ error: "Class access was restricted, but the student account restriction could not be updated." }, { status: 500 })
        }
      }
      return NextResponse.json({ data: { studentId: id, status } })
    }

    if (body.action === "set-lock") {
      if (typeof body.courseSlug !== "string" || typeof body.locked !== "boolean") {
        return NextResponse.json({ error: "Invalid classroom lock update." }, { status: 400 })
      }
      const supabase = await createAdminClient()
      const { data, error } = await supabase.from("classroom_rooms")
        .update({ is_locked: body.locked, updated_at: new Date().toISOString() })
        .eq("course_slug", body.courseSlug)
        .select("course_slug,is_locked")
        .single()
      if (error) {
        console.error("Classroom lock update failed:", error)
        return NextResponse.json({ error: "Unable to update class lock." }, { status: 500 })
      }
      return NextResponse.json({ data })
    }

    if (body.action === "restore-student") {
      if (typeof body.id !== "string") {
        return NextResponse.json({ error: "Invalid student classroom record." }, { status: 400 })
      }
      const supabase = await createAdminClient()
      const { error: accessError } = await supabase.from("classroom_students")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("student_id", body.id)
      if (accessError) {
        console.error("Student classroom restoration failed:", accessError)
        return NextResponse.json({ error: "Unable to restore student classroom access." }, { status: 500 })
      }
      const { error: restrictionError } = await supabase.from("students")
        .update({ restricted: false })
        .eq("id", body.id)
      if (restrictionError) {
        console.error("Student account restoration failed:", restrictionError)
        return NextResponse.json({ error: "Class access is pending, but the student account restriction could not be cleared." }, { status: 500 })
      }
      return NextResponse.json({ data: { studentId: body.id, status: "pending" } })
    }

    return NextResponse.json({ error: "Unknown classroom action." }, { status: 400 })
  } catch (error) {
    console.error("Classroom management update failed:", error)
    return NextResponse.json({ error: "Unable to update classroom management data." }, { status: 500 })
  }
}
