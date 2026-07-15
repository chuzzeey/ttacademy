import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { error: "PIN is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const email = user.email?.toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Authenticated user has no email" },
        { status: 400 }
      );
    }

    // Fetch the student record to verify PIN
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('pin, restricted')
      .ilike('email', email)
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