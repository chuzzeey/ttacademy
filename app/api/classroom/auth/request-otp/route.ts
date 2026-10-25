import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const allowedPayments = new Set(["fully paid", "1st installment", "2nd installment"])
const studentCodePattern = /^TTA-\d{5}[A-Z]$/i

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  return `${name.slice(0, 1)}${"*".repeat(Math.max(2, name.length - 1))}@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const loginType = body.loginType
    const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug.trim() : ""
    if (!["student", "teacher"].includes(loginType) || !courseSlug) {
      return NextResponse.json({ error: "Choose a class and sign-in type." }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { data: course, error: courseError } = await admin
      .from("classroom_courses")
      .select("slug")
      .eq("slug", courseSlug)
      .eq("is_active", true)
      .maybeSingle()
    if (courseError) throw courseError
    if (!course) return NextResponse.json({ error: "This class is not available." }, { status: 404 })

    const { data: room, error: roomError } = await admin
      .from("classroom_rooms")
      .select("is_locked,teacher_email,teacher_display_name")
      .eq("course_slug", courseSlug)
      .maybeSingle()
    if (roomError) throw roomError
    if (!room || room.is_locked) {
      return NextResponse.json({ error: "This classroom is currently locked." }, { status: 403 })
    }

    let email = ""
    let recipientName: string | null = null
    let linkedUserId: string | null = null
    let studentId: string | null = null
    if (loginType === "student") {
      const studentCode = typeof body.studentCode === "string" ? body.studentCode.trim().toUpperCase() : ""
      if (!studentCodePattern.test(studentCode)) {
        return NextResponse.json({ error: "Enter a valid student ID." }, { status: 400 })
      }
      const { data: student, error: studentError } = await admin
        .from("students")
        .select("id,student_code,email,name,restricted,payment_status")
        .eq("student_code", studentCode)
        .maybeSingle()
      if (studentError) throw studentError
      if (!student) return NextResponse.json({ error: "Student ID not found. Check the ID and try again." }, { status: 404 })

      const { data: membership, error: membershipError } = await admin
        .from("classroom_students")
        .select("course_slug,status,auth_user_id")
        .eq("student_id", student.id)
        .maybeSingle()
      if (membershipError) throw membershipError
      if (!membership || membership.course_slug !== courseSlug) {
        let assignedClass: string | null = null
        if (membership?.course_slug) {
          const { data: course, error: assignedCourseError } = await admin
            .from("classroom_courses")
            .select("title")
            .eq("slug", membership.course_slug)
            .maybeSingle()
          if (assignedCourseError) throw assignedCourseError
          assignedClass = course?.title ?? null
        }
        return NextResponse.json({
          error: assignedClass
            ? `This student ID is registered for ${assignedClass}, not this class.`
            : "This student ID is not assigned to a classroom.",
        }, { status: 403 })
      }
      if (student.restricted || membership.status === "restricted") {
        return NextResponse.json({ error: "You are restricted from joining this class. Contact the academy administrator." }, { status: 403 })
      }
      if (membership.status !== "approved") {
        return NextResponse.json({ error: "Your class access is awaiting administrator approval." }, { status: 403 })
      }
      if (!allowedPayments.has((student.payment_status ?? "").trim().toLowerCase())) {
        return NextResponse.json({ error: "Your payment is not approved for classroom access. Contact the academy administrator." }, { status: 403 })
      }
      email = student.email?.trim().toLowerCase() ?? ""
      recipientName = student.name?.trim() || null
      linkedUserId = membership.auth_user_id
      studentId = student.id
    } else {
      email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Enter a valid teacher email address." }, { status: 400 })
      }
      if (!room.teacher_email || room.teacher_email.trim().toLowerCase() !== email) {
        return NextResponse.json({ error: "This email is not assigned to teach this class. Contact the administrator." }, { status: 403 })
      }
      const { data: teacher, error: teacherError } = await admin
        .from("classroom_teachers")
        .select("status")
        .eq("course_slug", courseSlug)
        .eq("email", email)
        .eq("status", "restricted")
        .maybeSingle()
      if (teacherError) throw teacherError
      if (teacher) return NextResponse.json({ error: "Teacher access to this class has been restricted." }, { status: 403 })
      const { data: assignedTeacher, error: assignedTeacherError } = await admin
        .from("classroom_teachers")
        .select("user_id")
        .eq("course_slug", courseSlug)
        .eq("email", email)
        .neq("status", "restricted")
        .maybeSingle()
      if (assignedTeacherError) throw assignedTeacherError
      recipientName = room.teacher_display_name?.trim() || null
      linkedUserId = assignedTeacher?.user_id ?? null
    }

    if (!email) {
      return NextResponse.json({ error: "No email is on file for this account. Contact the administrator." }, { status: 400 })
    }

    if (recipientName && linkedUserId) {
      const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(linkedUserId)
      if (authUserError) throw authUserError
      const { error: metadataError } = await admin.auth.admin.updateUserById(linkedUserId, {
        user_metadata: {
          ...authUser.user.user_metadata,
          name: recipientName,
          first_name: recipientName.split(/\s+/)[0],
        },
      })
      if (metadataError) throw metadataError
    }

    const now = new Date()
    const { data: recentChallenge, error: recentError } = await admin
      .from("classroom_login_challenges")
      .select("id")
      .eq("login_type", loginType)
      .eq("course_slug", courseSlug)
      .eq("email", email)
      .gt("created_at", new Date(now.getTime() - 60_000).toISOString())
      .limit(1)
      .maybeSingle()
    if (recentError) throw recentError
    if (recentChallenge) {
      return NextResponse.json({ error: "A code was just sent. Wait a minute before requesting another." }, { status: 429 })
    }

    const { error: cleanupError } = await admin
      .from("classroom_login_challenges")
      .delete()
      .lt("expires_at", now.toISOString())
    if (cleanupError) throw cleanupError
    const { data: challenge, error: challengeError } = await admin
      .from("classroom_login_challenges")
      .insert({
        login_type: loginType,
        email,
        course_slug: courseSlug,
        student_id: studentId,
        expires_at: new Date(now.getTime() + 15 * 60_000).toISOString(),
      })
      .select("id")
      .single()
    if (challengeError || !challenge) throw challengeError ?? new Error("Could not create sign-in challenge.")

    const sessionClient = await createClient()
    const { error: otpError } = await sessionClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: recipientName
          ? { name: recipientName, first_name: recipientName.split(/\s+/)[0] }
          : {},
      },
    })
    if (otpError) {
      const { error: challengeCleanupError } = await admin
        .from("classroom_login_challenges")
        .delete()
        .eq("id", challenge.id)
      if (challengeCleanupError) console.error("Failed to clean up unsent classroom login challenge:", challengeCleanupError)
      console.error("Classroom one-time code email could not be sent:", otpError)
      return NextResponse.json({ error: "Could not send a sign-in code. Try again later." }, { status: 503 })
    }

    return NextResponse.json({
      challengeId: challenge.id,
      maskedEmail: maskEmail(email),
      expiresInMinutes: 15,
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Classroom one-time code request failed:", error)
    return NextResponse.json({ error: "Unable to request a classroom sign-in code." }, { status: 500 })
  }
}
