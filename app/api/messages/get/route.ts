import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/supabase/messages";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get("course");

    if (!course) {
      return NextResponse.json(
        { error: "Course parameter is required" },
        { status: 400 }
      );
    }

    const messages = await getMessages(course);

    return NextResponse.json(
      {
        data: messages,
      },
      {
        status: 200,
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("Fetch messages error:", message);

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
