import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentByEmail } from "@/lib/supabase/students";
import { createAdminClient } from "@/lib/supabase/server-admin";

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

    const studentId = user.app_metadata?.identity_type === "classroom_student"
      ? user.app_metadata.student_id
      : null;
    const student = typeof studentId === "string"
      ? await getStudentById(studentId)
      : user.email
        ? await getStudentByEmail(user.email.toLowerCase())
        : null;

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

async function getStudentById(studentId: string) {
  const supabase = await createAdminClient();
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (error) throw error;
  return student;
}
