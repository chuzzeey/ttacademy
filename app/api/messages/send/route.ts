import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/supabase/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      content,
      course,
      sender_name,
    } = body;

    if (!title || !content || !course || !sender_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await sendMessage({
      title: title.trim(),
      content: content.trim(),
      course: course.trim().toLowerCase(),
      sender_name: sender_name.trim(),
    });

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: message,
      },
      {
        status: 201,
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("Send message error:", message);

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
