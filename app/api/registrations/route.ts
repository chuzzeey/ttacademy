import { NextRequest, NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/supabase/admin-access";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

const studentDirectoryColumns = [
  "id",
  "student_code",
  "name",
  "date_of_birth",
  "email",
  "phone",
  "course",
  "sex",
  "country",
  "state",
  "employment_status",
  "has_laptop",
  "reason",
  "payment_status",
  "restricted",
  "reg_date",
  "reg_time",
  "created_at",
].join(",");

async function authorizeAdmin() {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return null;

  const { data: profile, error } = await authClient
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Student directory authorization failed:", error);
    return NextResponse.json({ error: "Unable to verify admin access" }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      full_name,
      date_of_birth,
      email,
      phone_whatsapp,
      sex,
      country,
      state,
      course_applying_for,
      employment_status,
      has_laptop,
      learning_reason,
    } = body;

    if (
      !full_name ||
      !date_of_birth ||
      !email ||
      !phone_whatsapp ||
      !sex ||
      !country ||
      !course_applying_for ||
      !employment_status ||
      !has_laptop
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dateOfBirth = new Date(`${date_of_birth}T00:00:00.000Z`);
    const validDateOfBirth =
      typeof date_of_birth === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date_of_birth) &&
      !Number.isNaN(dateOfBirth.getTime()) &&
      dateOfBirth.toISOString().slice(0, 10) === date_of_birth &&
      date_of_birth <= new Date().toISOString().slice(0, 10);

    if (!validDateOfBirth) {
      return NextResponse.json(
        { error: "A valid date of birth is required and cannot be in the future" },
        { status: 400 },
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);

    const regDate = `${day}/${month}/${year}`;
    const regTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const supabase = await createAdminClient()
    
    // Check if email already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existingStudent) {
      return NextResponse.json(
        { 
          error: "This email is already registered. Please use a different email or contact support if you need to access your existing account.",
          code: "EMAIL_EXISTS"
        },
        { status: 409 }
      )
    }

    const { data: student, error: insertError } = await supabase
      .from('students')
      .insert({
        name: full_name.trim(),
        date_of_birth,
        email: email.trim().toLowerCase(),
        phone: phone_whatsapp.trim(),
        course: course_applying_for,
        sex: sex,
        country: country,
        state: state || null,
        employment_status: employment_status,
        has_laptop: has_laptop,
        reason: (learning_reason || "").trim(),
        payment_plan: "Not Paid Yet",
        payment_status: "Not Paid Yet",
        reg_date: regDate,
        reg_time: regTime,
      })
      .select("id,student_code,name,email,course,created_at")
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json(
        { error: insertError.message || "Failed to save registration. Please try again." },
        { status: 500 }
      )
    }

    // Create Supabase auth user with default password "123456"
    try {
      const supabase = await createAdminClient()
      const { error: authError } = await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: "123456",
        email_confirm: true,
        user_metadata: {
          name: full_name.trim(),
          course: course_applying_for,
          role: "student"
        }
      })

      if (authError) {
        console.error("Failed to create auth user:", authError)
        // Don't fail the registration if auth user creation fails
      }
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError)
      // Don't fail the registration if Supabase is not configured
    }

    return NextResponse.json(
      {
        message: "Registration submitted successfully",
        data: student,
      },
      {
        status: 201,
      }
    );

  } catch (err: any) {
    let errorMessage = "An unexpected error occurred. Please try again."
    
    if (err instanceof Error) {
      errorMessage = err.message
    } else if (typeof err === 'object' && err !== null) {
      // Handle Supabase error objects
      if (err.message) {
        errorMessage = err.message
      } else if (err.error) {
        errorMessage = typeof err.error === 'string' ? err.error : JSON.stringify(err.error)
      } else {
        errorMessage = JSON.stringify(err)
      }
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    console.error("Registration API error:", errorMessage)

    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return authorizationError;

    const body = await request.json();

    const {
      studentId,
      payment_status,
      restricted,
    } = body;

    if (typeof studentId !== "string" || !studentId.trim()) {
      return NextResponse.json(
        {
          error: "Missing studentId",
        },
        {
          status: 400,
        }
      );
    }

    const updateData: { payment_status?: string; payment_plan?: string; restricted?: boolean } = {}

    if (payment_status !== undefined) {
      const validStatuses = [
        "Not Paid Yet",
        "Not Paid",
        "Fully Paid",
        "1st Installment",
        "2nd Installment",
      ];

      if (!validStatuses.includes(payment_status)) {
        return NextResponse.json(
          {
            error: "Invalid payment status",
          },
          {
            status: 400,
          }
        );
      }
      updateData.payment_status = payment_status
      updateData.payment_plan = payment_status
    }

    if (restricted !== undefined) {
      if (typeof restricted !== "boolean") {
        return NextResponse.json({ error: "Invalid restriction value" }, { status: 400 });
      }
      updateData.restricted = restricted
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid student updates provided" }, { status: 400 });
    }

    const supabase = await createAdminClient()
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId.trim())
      .select('id,payment_status,payment_plan,restricted')
      .single()

    if (updateError) {
      console.error("Student update query failed:", updateError);
      return NextResponse.json({ error: "Unable to update student" }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Student updated successfully",
        data: updatedStudent,
      },
      {
        status: 200,
      }
    );

  } catch (err) {
    console.error("Student update error:", err);

    return NextResponse.json(
      {
        error: "Unable to update student",
      },
      {
        status: 500,
      }
    );
  }
}


export async function GET() {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return authorizationError;

    const supabase = await createAdminClient()
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select(studentDirectoryColumns)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error("Student directory query failed:", fetchError);
      return NextResponse.json({ error: "Unable to load student directory" }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: students,
      },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      }
    );

  } catch (err) {
    console.error("Registration fetch error:", err);

    return NextResponse.json(
      {
        error: "Unable to load student directory",
      },
      {
        status: 500,
      }
    );
  }
}