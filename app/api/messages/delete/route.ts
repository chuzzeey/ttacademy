import { NextRequest, NextResponse } from "next/server";
import { deleteMessage } from "@/lib/supabase/messages";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId } = body;

    if (typeof messageId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(messageId)) {
      return NextResponse.json(
        { error: "A valid message ID is required." },
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

    const status = message === "Authentication required." ? 401
      : message.includes("own classroom messages") ? 403
        : message === "This classroom message is unavailable." ? 404 : 500
    return NextResponse.json(
      {
        error: status === 500 ? "Unable to delete this message." : message,
      },
      {
        status,
      }
    );
  }
}
