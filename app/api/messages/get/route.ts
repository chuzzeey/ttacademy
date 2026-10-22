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
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course)) {
      return NextResponse.json({ error: "Invalid course." }, { status: 400 })
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
    console.error("Fetch messages error:", err);

    return NextResponse.json(
      {
        error: "Unable to load classroom messages.",
      },
      {
        status: 500,
      }
    );
  }
}
