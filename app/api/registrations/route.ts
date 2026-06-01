import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { full_name, email, phone_whatsapp, sex, country, state, course_applying_for, employment_status, has_laptop, heard_about_us, learning_reason } = body;

    if (!full_name || !email || !phone_whatsapp || !sex || !country || !course_applying_for || !employment_status || !has_laptop || !heard_about_us || !learning_reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate dates for the students table
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const regDate = `${day}/${month}/${year}`;
    const regTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const timestamp = now.toISOString();

    // Build state_of_residence from state + country
    const stateOfResidence = state
      ? `${state}, ${country}`
      : country;

    const { data, error } = await supabase
      .from("students")
      .insert({
        name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone_whatsapp.trim(),
        course: course_applying_for,
        reg_date: regDate,
        reg_time: regTime,
        timestamp,
        gender: sex,
        state_of_residence: stateOfResidence,
        learning_track: course_applying_for,
        how_did_you_hear: heard_about_us,
        has_laptop_and_internet: has_laptop,
        current_employment_status: employment_status,
        wants_scholarship: "no",
        why_learn_this_skill: learning_reason.trim(),
        payment_plan: "Not Paid Yet",
        amount_paid: 0,
        balance_remaining: 0,
        status: "None",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to save registration", details: error.message, code: error.code, hint: error.hint, details_full: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Registration submitted successfully", data },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Registration API error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch registrations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Registration fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}