import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Verify the password by attempting to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    })

    if (signInError || !signInData.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user metadata
    const userMetadata = signInData.user.user_metadata || {}
    const userCourseRaw = userMetadata.course || ""

    // Check student enrollment status in database
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('payment_status, course, restricted')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (studentError || !student) {
      // Sign out the user
      await supabase.auth.signOut()
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
      // Sign out the user
      await supabase.auth.signOut()
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
      // Sign out the user
      await supabase.auth.signOut()
      
      // Get student name for the WhatsApp message
      const { data: studentData } = await supabase
        .from('students')
        .select('name')
        .eq('email', email.trim().toLowerCase())
        .single()
      
      return NextResponse.json(
        { 
          error: "Your account has been restricted by the admin. Please contact support for assistance.",
          code: "ACCOUNT_RESTRICTED",
          studentName: studentData?.name || email.trim().toLowerCase(),
          studentEmail: email.trim().toLowerCase()
        },
        { status: 403 }
      )
    }

    // Sign out the user immediately since this is just for verification
    await supabase.auth.signOut()

    return NextResponse.json(
      {
        message: "Login successful",
        data: {
          id: signInData.user.id,
          name: userMetadata.name || "",
          email: signInData.user.email || "",
          course: userCourseRaw,
          courseSlug: userCourseRaw
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, ""),
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