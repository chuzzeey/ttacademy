import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentByEmail } from "@/lib/supabase/students";

export async function GET() {
  try {
    // Get the authenticated user from Supabase session (server-side)
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

    // Query Supabase for the student matching this email
    const student = await getStudentByEmail(email);

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: student },
      { status: 200 }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Profile fetch error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
