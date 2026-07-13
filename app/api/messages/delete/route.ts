import { NextRequest, NextResponse } from "next/server";
import { deleteMessage } from "@/lib/supabase/messages";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    await deleteMessage(messageId);

    return NextResponse.json(
      {
        message: "Message deleted successfully",
      },
      {
        status: 200,
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("Delete message error:", message);

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
