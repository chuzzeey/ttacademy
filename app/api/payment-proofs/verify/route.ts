import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { COURSE_CATALOG } from "@/lib/course-catalog"

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json()
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Select a course and enter your student ID." }, { status: 400 })
    }

    const { course, studentCode } = payload as Record<string, unknown>
    if (
      typeof course !== "string" ||
      !COURSE_CATALOG.some(({ title }) => title.toLowerCase() === course) ||
      typeof studentCode !== "string" ||
      studentCode.trim().length < 4 ||
      studentCode.trim().length > 40
    ) {
      return NextResponse.json({ error: "Select a valid course and enter your student ID." }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data: student, error } = await supabase
      .from("students")
      .select("student_code,course,payment_status")
      .eq("student_code", studentCode.trim().toUpperCase())
      .maybeSingle()

    if (error) {
      console.error("Payment proof student lookup failed:", error)
      return NextResponse.json({ error: "Unable to verify your student ID right now." }, { status: 500 })
    }
    if (!student) {
      return NextResponse.json({ valid: false, error: "We couldn't find this student ID. Check it and try again." }, { status: 404 })
    }
    if (student.payment_status?.trim().toLowerCase() === "fully paid") {
      return NextResponse.json({ valid: false, error: "Our records already show this course as fully paid. Contact the Academy if you need help." }, { status: 409 })
    }
    if ((student.course || "").trim().toLowerCase() !== course) {
      const actualCourse = COURSE_CATALOG.find(({ title }) => title.toLowerCase() === student.course?.trim().toLowerCase())?.title
      return NextResponse.json({
        valid: false,
        ...(actualCourse ? { course: actualCourse } : {}),
        error: actualCourse ? undefined : "This student ID isn't registered for the selected course.",
      }, { status: 409 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Payment proof student verification request failed:", error)
    return NextResponse.json({ error: "Unable to verify your student ID right now." }, { status: 500 })
  }
}
