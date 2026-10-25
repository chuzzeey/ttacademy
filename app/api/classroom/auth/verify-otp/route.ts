import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const allowedPayments = new Set(["fully paid", "1st installment", "2nd installment"])

export async function POST(request: NextRequest) {
  const sessionClient = await createClient()
  let didVerifyOtp = false
  try {
    const body = await request.json()
    const challengeId = typeof body.challengeId === "string" ? body.challengeId : ""
    const code = typeof body.code === "string" ? body.code.trim() : ""
    if (!challengeId || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit code from your email." }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { data: challenge, error: challengeError } = await admin
      .from("classroom_login_challenges")
      .select("id,login_type,email,course_slug,student_id,expires_at,consumed_at")
      .eq("id", challengeId)
      .maybeSingle()
    if (challengeError) throw challengeError
    if (!challenge || challenge.consumed_at || Date.parse(challenge.expires_at) <= Date.now()) {
      return NextResponse.json({ error: "This code has expired. Request a new code to continue." }, { status: 410 })
    }

    const { data: authResult, error: otpError } = await sessionClient.auth.verifyOtp({
      email: challenge.email,
      token: code,
      type: "email",
    })
    if (otpError || !authResult.user) {
      return NextResponse.json({ error: "That code is invalid or expired. Check it and try again." }, { status: 401 })
    }
    didVerifyOtp = true
    const user = authResult.user
    const email = user.email?.trim().toLowerCase()
    if (!email || email !== challenge.email.trim().toLowerCase()) {
      await sessionClient.auth.signOut()
      return NextResponse.json({ error: "The verified account does not match this sign-in request." }, { status: 403 })
    }

    const rejectVerifiedSession = async (message: string, status: number) => {
      const { error: signOutError } = await sessionClient.auth.signOut()
      if (signOutError) console.error("Failed to clear rejected classroom sign-in:", signOutError)
      return NextResponse.json({ error: message }, { status })
    }

    const { data: course, error: courseError } = await admin
      .from("classroom_courses")
      .select("slug")
      .eq("slug", challenge.course_slug)
      .eq("is_active", true)
      .maybeSingle()
    if (courseError) throw courseError
    const { data: room, error: roomError } = await admin
      .from("classroom_rooms")
      .select("is_locked,teacher_email,teacher_display_name")
      .eq("course_slug", challenge.course_slug)
      .maybeSingle()
    if (roomError) throw roomError
    if (!course || !room || room.is_locked) {
      return await rejectVerifiedSession("This classroom is no longer available.", 403)
    }

    let displayName = ""
    if (challenge.login_type === "student" && challenge.student_id) {
      const { data: student, error: studentError } = await admin
        .from("students")
        .select("id,email,name,restricted,payment_status")
        .eq("id", challenge.student_id)
        .maybeSingle()
      if (studentError) throw studentError
      const { data: membership, error: membershipError } = await admin
        .from("classroom_students")
        .select("student_id,course_slug,status,auth_user_id")
        .eq("student_id", challenge.student_id)
        .maybeSingle()
      if (membershipError) throw membershipError
      if (!student || student.email?.trim().toLowerCase() !== email) {
        return await rejectVerifiedSession("The student record no longer matches this sign-in request.", 403)
      }
      if (student.restricted || membership?.status === "restricted") {
        return await rejectVerifiedSession("You are restricted from joining this class. Contact the academy administrator.", 403)
      }
      if (!membership || membership.course_slug !== challenge.course_slug) {
        return await rejectVerifiedSession("This student ID is not assigned to this class.", 403)
      }
      if (membership.status !== "approved") {
        return await rejectVerifiedSession("Your class access is awaiting administrator approval.", 403)
      }
      if (!allowedPayments.has((student.payment_status ?? "").trim().toLowerCase())) {
        return await rejectVerifiedSession("Your payment is not approved for classroom access.", 403)
      }

      const { data: existingMembership, error: existingMembershipError } = await admin
        .from("classroom_students")
        .select("student_id")
        .eq("auth_user_id", user.id)
        .maybeSingle()
      if (existingMembershipError) throw existingMembershipError
      if (existingMembership && existingMembership.student_id !== student.id) {
        return await rejectVerifiedSession("This account is already linked to a different student ID.", 403)
      }

      const { error: linkError } = await admin
        .from("classroom_students")
        .update({ auth_user_id: user.id, updated_at: new Date().toISOString() })
        .eq("student_id", student.id)
        .eq("course_slug", challenge.course_slug)
      if (linkError) throw linkError
      displayName = student.name || email
    } else if (challenge.login_type === "teacher" && !challenge.student_id) {
      if (!room.teacher_email || room.teacher_email.trim().toLowerCase() !== email) {
        return await rejectVerifiedSession("This email is no longer assigned to teach this class.", 403)
      }
      const { data: restrictedTeacher, error: restrictedTeacherError } = await admin
        .from("classroom_teachers")
        .select("id")
        .eq("course_slug", challenge.course_slug)
        .eq("email", email)
        .eq("status", "restricted")
        .maybeSingle()
      if (restrictedTeacherError) throw restrictedTeacherError
      if (restrictedTeacher) {
        return await rejectVerifiedSession("Teacher access to this class has been restricted.", 403)
      }

      const { data: assignedTeacher, error: assignedTeacherError } = await admin
        .from("classroom_teachers")
        .select("id,email,status")
        .eq("course_slug", challenge.course_slug)
        .neq("status", "restricted")
        .maybeSingle()
      if (assignedTeacherError) throw assignedTeacherError
      if (assignedTeacher && assignedTeacher.email.toLowerCase() !== email) {
        return await rejectVerifiedSession("Another teacher is already assigned to this class.", 409)
      }

      displayName = room.teacher_display_name?.trim()
        || (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "")
        || email.split("@")[0]
      const teacherValues = {
        user_id: user.id,
        course_slug: challenge.course_slug,
        email,
        display_name: displayName,
        status: "approved",
        updated_at: new Date().toISOString(),
      }
      const { error: teacherSaveError } = assignedTeacher
        ? await admin.from("classroom_teachers").update(teacherValues).eq("id", assignedTeacher.id)
        : await admin.from("classroom_teachers").insert(teacherValues)
      if (teacherSaveError) throw teacherSaveError
    } else {
      return await rejectVerifiedSession("This classroom sign-in request is invalid.", 400)
    }

    const { data: consumedChallenge, error: consumeError } = await admin
      .from("classroom_login_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", challenge.id)
      .is("consumed_at", null)
      .select("id")
      .maybeSingle()
    if (consumeError) throw consumeError
    if (!consumedChallenge) {
      return await rejectVerifiedSession("This sign-in code was already used. Request a new code to continue.", 409)
    }

    return NextResponse.json({
      role: challenge.login_type,
      courseSlug: challenge.course_slug,
      name: displayName,
      email,
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Classroom one-time code verification failed:", error)
    if (didVerifyOtp) {
      const { error: signOutError } = await sessionClient.auth.signOut()
      if (signOutError) console.error("Failed to clear classroom session after verification error:", signOutError)
    }
    return NextResponse.json({ error: "Unable to verify the classroom sign-in code." }, { status: 500 })
  }
}
