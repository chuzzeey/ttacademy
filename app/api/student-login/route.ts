import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string"
      ? body.identifier.trim()
      : typeof body.email === "string"
        ? body.email.trim()
        : "";

    if (!identifier) {
      return NextResponse.json(
        { error: "Email address or student ID is required" },
        { status: 400 }
      );
    }

    const { createAdminClient } = await import('@/lib/supabase/server-admin')
    const supabase = await createAdminClient()

    const isStudentCode = /^TTA-\d{5}[A-Z]$/i.test(identifier)
    const studentQuery = supabase
      .from('students')
      .select('id, student_code, payment_status, course, restricted, name, email')
    const { data: student, error: studentError } = isStudentCode
      ? await studentQuery.eq('student_code', identifier.toUpperCase()).single()
      : await studentQuery.eq('email', identifier.toLowerCase()).single()

    if (studentError || !student) {
      return NextResponse.json(
        { 
          error: "Student record not found. Please contact admin.",
          code: "NO_STUDENT_RECORD"
        },
        { status: 404 }
      )
    }

    // Check payment status
    const paymentStatus = student.payment_status?.toLowerCase() || ""
    const isPaid = paymentStatus === "fully paid" || 
                   paymentStatus === "1st installment" || 
                   paymentStatus === "2nd installment"

    if (!isPaid) {
      return NextResponse.json(
        { 
          error: "You cannot log in because you have not paid yet. Please contact admin to complete your payment.",
          code: "NOT_ENROLLED"
        },
        { status: 403 }
      )
    }

    // Check if account is restricted
    if (student.restricted) {
      return NextResponse.json(
        { 
          error: "Your account has been restricted by the admin. Please contact support for assistance.",
          code: "ACCOUNT_RESTRICTED",
          studentName: student.name || student.email,
          studentEmail: student.email
        },
        { status: 403 }
      )
    }

    // Normalize course name to slug format
    const userCourseRaw = student.course || ""
    const courseSlug = userCourseRaw
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    return NextResponse.json(
      {
        message: "Student identity verified successfully",
        data: {
          id: student.id,
          studentCode: student.student_code,
          name: student.name || "",
          email: student.email || "",
          course: userCourseRaw,
          courseSlug: courseSlug,
          payment_status: student.payment_status,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Login API error:", message);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
