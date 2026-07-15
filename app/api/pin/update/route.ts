import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPin, newPin } = body;

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { error: "Current PIN and new PIN are required" },
        { status: 400 }
      );
    }

    // Validate PIN is numbers only
    if (!/^\d+$/.test(newPin)) {
      return NextResponse.json(
        { error: "PIN must contain only numbers" },
        { status: 400 }
      );
    }

    // Validate PIN length (6-8 digits)
    if (newPin.length < 6 || newPin.length > 8) {
      return NextResponse.json(
        { error: "PIN must be between 6 and 8 digits" },
        { status: 400 }
      );
    }

    if (currentPin === newPin) {
      return NextResponse.json(
        { error: "New PIN must be different from current PIN" },
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

    // Fetch the student record to verify current PIN
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .ilike('email', email)
      .single();

    if (fetchError || !student) {
      console.error('Student not found:', fetchError, email)
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // Verify current PIN (trim whitespace and compare as strings)
    const dbPin = String(student.pin || '').trim()
    const inputPin = String(currentPin).trim()
    
    console.log('PIN verification:', { 
      email, 
      dbPin, 
      inputPin, 
      match: dbPin === inputPin,
      studentId: student.id,
      studentData: student
    })
    
    // Check if PIN matches
    const isCorrectPin = dbPin === inputPin
    
    if (!isCorrectPin) {
      // Return more helpful error for debugging
      const errorMsg = dbPin === '' 
        ? "No PIN set for this account. Please contact support." 
        : "Current PIN is incorrect"
      
      return NextResponse.json(
        { 
          error: errorMsg,
          debug: process.env.NODE_ENV === 'development' ? {
            dbPin: dbPin === '' ? 'PIN is empty/NULL' : 'PIN exists',
            inputPin: inputPin ? 'PIN provided' : 'No PIN entered'
          } : undefined
        },
        { status: 403 }
      );
    }

    // Update the PIN
    const { error: updateError } = await supabase
      .from('students')
      .update({ pin: newPin, updated_at: new Date().toISOString() })
      .ilike('email', email);

    if (updateError) {
      console.error("PIN update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update PIN" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "PIN updated successfully" },
      { status: 200 }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PIN update API error:", message);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}