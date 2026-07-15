import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Simple database query - no authentication needed
    const { createAdminClient } = await import('@/lib/supabase/server-admin')
    const supabase = await createAdminClient()

    // Check if student exists in database
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, payment_status, course, restricted, name, email')
      .eq('email', email.trim().toLowerCase())
      .single()

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
          studentName: student.name || email.trim().toLowerCase(),
          studentEmail: email.trim().toLowerCase()
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
        message: "Email verified successfully",
        data: {
          id: student.id,
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
