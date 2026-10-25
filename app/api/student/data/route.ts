import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentByEmail } from "@/lib/supabase/students";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const supabaseAuth = await createClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const email = user.email.trim().toLowerCase()
    if (!requestedEmail || requestedEmail !== email) {
      return NextResponse.json(
        { error: "You can only request your own student record." },
        { status: 403 }
      );
    }

    const student = await getStudentByEmail(email)
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: { id: student.id, name: student.name, email: student.email, avatar: student.avatar ?? null } },
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