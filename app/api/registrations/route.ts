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
        email: email.trim().toLowerCase(),
        phone: phone_whatsapp.trim(),
        course: course_applying_for,
        sex: sex,
        country: country,
        state: state || null,
        employment_status: employment_status,
        has_laptop: has_laptop,
        reason: (learning_reason || "").trim(),
        payment_status: "Not Paid",
        reg_date: regDate,
        reg_time: regTime,
      })
      .select()
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
    const body = await request.json();

    const {
      studentId,
      payment_status,
      restricted,
    } = body;

    if (!studentId) {
      return NextResponse.json(
        {
          error: "Missing studentId",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createAdminClient()
    
    // Build update object
    const updateData: any = {}
    
    if (payment_status) {
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
      updateData.payment_status = payment_status
    }

    if (restricted !== undefined) {
      updateData.restricted = restricted
    }

    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)
      .select()
      .single()

    if (updateError) throw updateError

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
    const message = err instanceof Error ? err.message : String(err);

    console.error("Student update error:", message);

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