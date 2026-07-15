import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin, email } = body;

    if (!pin) {
      return NextResponse.json(
        { error: "PIN is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Use admin client to query database without authentication
    const { createAdminClient } = await import('@/lib/supabase/server-admin')
    const supabase = await createAdminClient()

    // Fetch the student record to verify PIN
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('pin, restricted, course, name, id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (fetchError || !student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // Check if account is restricted
    if (student.restricted) {
      return NextResponse.json(
        { error: "Your account has been restricted", code: "ACCOUNT_RESTRICTED" },
        { status: 403 }
      );
    }

    // Verify PIN
    const dbPin = String(student.pin || '').trim()
    const inputPin = String(pin).trim()

    if (dbPin !== inputPin) {
      return NextResponse.json(
        { error: "Incorrect PIN" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "PIN verified successfully" },
      { status: 200 }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PIN verification API error:", message);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}