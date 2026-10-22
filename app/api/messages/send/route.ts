import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/supabase/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { content, course, attachmentPath, attachmentName, attachmentMimeType } = body;

    if (typeof content !== "string" || typeof course !== "string") {
      return NextResponse.json(
        { error: "A classroom and message content are required." },
        { status: 400 }
      );
    }

    const message = await sendMessage({
      content,
      course: course.trim().toLowerCase(),
      attachmentPath: typeof attachmentPath === "string" ? attachmentPath : undefined,
      attachmentName: typeof attachmentName === "string" ? attachmentName : undefined,
      attachmentMimeType: typeof attachmentMimeType === "string" ? attachmentMimeType : undefined,
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
    console.error("Send message error:", err);

    return NextResponse.json(
      {
        error: err instanceof Error && ["Authentication required.", "You do not have access to this classroom.", "Write a message or attach a file.", "Messages must be 5,000 characters or fewer.", "The attachment path is invalid for this classroom."].includes(err.message)
          ? err.message
          : "Unable to send the classroom message.",
      },
      {
        status: 500,
      }
    );
  }
}
