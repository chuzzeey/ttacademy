import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      full_name,
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
    const { data: student, error: insertError } = await supabase
      .from('students')
      .insert({
        name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone_whatsapp.trim(),
        course: course_applying_for,
        sex,
        country,
        state: state || null,
        employment_status,
        has_laptop,
        reason: (learning_reason || "").trim(),
        payment_status: "Not Paid",
        password: "123456",
        reg_date: regDate,
        reg_time: regTime,
      })
      .select()
      .single()

    if (insertError) throw insertError

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

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("Registration API error:", message);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      studentId,
      payment_status,
    } = body;

    if (!studentId || !payment_status) {
      return NextResponse.json(
        {
          error: "Missing studentId or payment_status",
        },
        {
          status: 400,
        }
      );
    }

    const validStatuses = [
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

    const supabase = await createAdminClient()
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({ payment_status })
      .eq('id', studentId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(
      {
        message: "Payment status updated successfully",
        data: updatedStudent,
      },
      {
        status: 200,
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("Payment status update error:", message);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}


export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    return NextResponse.json(
      {
        data: students,
      },
      {
        status: 200,
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("Registration fetch error:", message);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}