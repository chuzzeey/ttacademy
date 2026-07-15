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
      .select('pin, restricted, course, name, id, email')
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

    // Verify PIN (accept both old default '0000' and new default '123456')
    const dbPin = String(student.pin || '').trim()
    const inputPin = String(pin).trim()
    
    console.log('PIN verification:', { dbPin, inputPin, match: dbPin === inputPin, email, studentId: student.id })

    // Check if PIN matches (accept both '0000' and '123456' as defaults for backward compatibility)
    const defaultPins = ['0000', '123456']
    const isDefaultPin = defaultPins.includes(dbPin) && defaultPins.includes(inputPin)
    const isValidPin = dbPin === inputPin || isDefaultPin
    
    console.log('PIN check:', { dbPin, inputPin, isDefaultPin, isValidPin, email })
    
    if (!isValidPin) {
      console.log('PIN verification failed:', { dbPin, inputPin, email, studentId: student.id })
      return NextResponse.json(
        { 
          error: "Incorrect PIN. Please try again.",
          hint: process.env.NODE_ENV === 'development' ? `Default PIN is 123456 (DB PIN: ${dbPin || 'not set'})` : undefined
        },
        { status: 403 }
      );
    }

    // Return student data for the frontend
    return NextResponse.json(
      { 
        message: "PIN verified successfully",
        data: {
          id: student.id,
          name: student.name,
          email: student.email,
          course: student.course
        }
      },
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