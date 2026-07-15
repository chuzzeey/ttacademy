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

    // Use admin client to query database without authentication
    const { createAdminClient } = await import('@/lib/supabase/server-admin')
    const supabase = await createAdminClient()

    // Fetch the complete student record
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (fetchError || !student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // Return student data
    return NextResponse.json(
      { data: student },
      { status: 200 }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Student data fetch error:", message);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}