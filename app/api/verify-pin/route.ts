import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { COURSE_CATALOG } from "@/lib/course-catalog";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug : "";

    if (!pin) return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!courseSlug) return NextResponse.json({ error: "Course is required" }, { status: 400 });

    const admin = await createAdminClient();
    const { data: student, error: studentError } = await admin
      .from("students")
      .select("pin,restricted,course,name,id,email")
      .eq("email", email)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }
    if (student.restricted) {
      return NextResponse.json(
        { error: "Your account has been restricted", code: "ACCOUNT_RESTRICTED" },
        { status: 403 },
      );
    }

    const storedPin = String(student.pin || "").trim();
    if (!storedPin || storedPin !== pin) {
      return NextResponse.json({ error: "Incorrect PIN. Please try again." }, { status: 403 });
    }

    const studentCourse = COURSE_CATALOG.find((course) =>
      course.slug === student.course?.trim().toLowerCase()
      || course.title.toLowerCase() === student.course?.trim().toLowerCase(),
    );
    if (!studentCourse || studentCourse.slug !== courseSlug) {
      return NextResponse.json({ error: "You are not authorized to access this course." }, { status: 403 });
    }

    const { data: membership, error: membershipError } = await admin
      .from("classroom_students")
      .select("auth_user_id")
      .eq("student_id", student.id)
      .eq("course_slug", courseSlug)
      .maybeSingle();

    if (membershipError) {
      console.error("Classroom student lookup failed:", membershipError);
      return NextResponse.json({ error: "Classroom access is not configured yet." }, { status: 503 });
    }
    if (!membership) {
      return NextResponse.json({ error: "Student is not enrolled in this classroom." }, { status: 403 });
    }

    const authEmail = `student-${student.id}@students.invalid`;
    const password = randomBytes(32).toString("base64url");
    let authUserId: string | null = membership.auth_user_id;

    if (!authUserId) {
      for (let page = 1; ; page += 1) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
          console.error("Classroom student identity lookup failed:", error);
          return NextResponse.json({ error: "Unable to establish classroom sign-in." }, { status: 500 });
        }
        const existingUser = data.users.find((user) => user.email?.toLowerCase() === authEmail);
        if (existingUser) {
          if (existingUser.app_metadata?.student_id !== student.id) {
            console.error("Classroom student identity metadata mismatch:", { studentId: student.id });
            return NextResponse.json({ error: "Unable to establish classroom sign-in." }, { status: 500 });
          }
          authUserId = existingUser.id;
          break;
        }
        if (data.users.length < 1000) break;
      }
    }

    if (!authUserId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
        app_metadata: { student_id: student.id, identity_type: "classroom_student" },
      });
      if (error || !data.user) {
        console.error("Classroom student identity creation failed:", error);
        return NextResponse.json({ error: "Unable to establish classroom sign-in." }, { status: 500 });
      }
      authUserId = data.user.id;
    }

    const { data: identityResult, error: identityError } = await admin.auth.admin.updateUserById(authUserId, {
      password,
      app_metadata: { student_id: student.id, identity_type: "classroom_student" },
    });
    if (identityError || !identityResult.user) {
      console.error("Classroom student credential rotation failed:", identityError);
      return NextResponse.json({ error: "Unable to establish classroom sign-in." }, { status: 500 });
    }

    const { error: linkError } = await admin
      .from("classroom_students")
      .update({ auth_user_id: authUserId })
      .eq("student_id", student.id)
      .eq("course_slug", courseSlug);
    if (linkError) {
      console.error("Classroom student identity linking failed:", linkError);
      return NextResponse.json({ error: "Unable to establish classroom sign-in." }, { status: 500 });
    }

    const sessionClient = await createClient();
    const { error: signInError } = await sessionClient.auth.signInWithPassword({
      email: authEmail,
      password,
    });
    if (signInError) {
      console.error("Classroom student session creation failed:", signInError);
      return NextResponse.json({ error: "Unable to establish classroom sign-in." }, { status: 500 });
    }

    return NextResponse.json({
      message: "PIN verified successfully",
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
      },
    });
  } catch (error) {
    console.error("PIN verification API error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
