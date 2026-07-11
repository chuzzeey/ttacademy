import { NextRequest, NextResponse } from "next/server";

// Prisma client - only initialized if DATABASE_URL is set
let prisma: any = null;

async function getPrisma() {
  if (prisma) return prisma;
  try {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
    return prisma;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getPrisma();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured. Please add DATABASE_URL to your .env file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { full_name, email, phone_whatsapp, sex, country, state, course_applying_for, employment_status, has_laptop, learning_reason } = body;

    if (!full_name || !email || !phone_whatsapp || !sex || !country || !course_applying_for || !employment_status || !has_laptop) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const regDate = `${day}/${month}/${year}`;
    const regTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const student = await db.student.create({
      data: {
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
        reg_date: regDate,
        reg_time: regTime,
      },
    });

    return NextResponse.json({ message: "Registration submitted successfully", data: student }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Registration API error:", message);
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = await getPrisma();
    if (!db) {
      return NextResponse.json({ error: "Database not configured. Please add DATABASE_URL to your .env file." }, { status: 500 });
    }

    const body = await request.json();
    const { studentId, payment_status } = body;

    if (!studentId || !payment_status) {
      return NextResponse.json({ error: "Missing studentId or payment_status" }, { status: 400 });
    }

    const validStatuses = ["Not Paid", "Fully Paid", "1st Installment", "2nd Installment"];
    if (!validStatuses.includes(payment_status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: { payment_status },
    });

    return NextResponse.json({ message: "Payment status updated successfully", data: updatedStudent }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Payment status update error:", message);
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getPrisma();
    if (!db) {
      return NextResponse.json({ data: [], message: "Database not configured. Add DATABASE_URL to .env" }, { status: 200 });
    }

    const students = await db.student.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: students }, { status: 200 });
  } catch (err) {
    console.error("Registration fetch error:", err);
    return NextResponse.json({ data: [], error: "Internal server error" }, { status: 200 });
  }
}
