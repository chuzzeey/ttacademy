import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ exists: false, valid: false, message: "Invalid email format" });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("students")
      .select("id")
      .eq("email", trimmedEmail)
      .limit(1);

    if (error) {
      console.error("Email check error:", error);
      return NextResponse.json({ exists: false, valid: true, message: "Could not verify email" });
    }

    if (data && data.length > 0) {
      return NextResponse.json({
        exists: true,
        valid: true,
        message: "This email is already registered. Please use a different email address or contact support if you believe this is an error.",
      });
    }

    return NextResponse.json({ exists: false, valid: true, message: "Email is available" });
  } catch (err) {
    console.error("Check email API error:", err);
    return NextResponse.json({ exists: false, valid: true, message: "Could not verify email" });
  }
}