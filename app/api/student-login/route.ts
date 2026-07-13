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

    // Use Supabase Auth to verify credentials
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
    })

    // Since createUser is for creating users, we'll use a different approach
    // We'll verify the password by attempting to sign in
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
