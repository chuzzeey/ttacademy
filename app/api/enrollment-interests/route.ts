import { NextRequest, NextResponse } from "next/server";
import { courses } from "@/ttacademy-website/lib/content";
import { createAdminClient } from "@/lib/supabase/server-admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s().-]{7,24}$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const fullName = typeof data.full_name === "string" ? data.full_name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const course = typeof data.course === "string" ? data.course.trim() : "";
  const goals = typeof data.goals === "string" ? data.goals.trim() : "";

  if (fullName.length < 2 || fullName.length > 160) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (!phonePattern.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  if (!courses.some((item) => item.title === course)) {
    return NextResponse.json({ error: "Choose a valid learning interest." }, { status: 400 });
  }
  if (goals.length > 3000) {
    return NextResponse.json({ error: "Goals must be 3000 characters or fewer." }, { status: 400 });
  }
  if (data.consent !== true) {
    return NextResponse.json(
      { error: "Consent is required before we can contact you." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("enrollment_interests").insert({
      full_name: fullName,
      email,
      phone,
      course,
      goals: goals || null,
      consent: true,
    });

    if (error) {
      console.error("Enrollment interest database insert failed:", error);
      return NextResponse.json(
        { error: "Unable to save your interest right now. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Enrollment interest submission failed:", error);
    return NextResponse.json(
      { error: "Unable to save your interest right now. Please try again." },
      { status: 500 },
    );
  }
}
