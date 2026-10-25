import { NextRequest, NextResponse } from "next/server"
import { editMessage } from "@/lib/supabase/messages"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    if (typeof body.messageId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.messageId) || typeof body.content !== "string") {
      return NextResponse.json({ error: "A message and updated text are required." }, { status: 400 })
    }
    const data = await editMessage(body.messageId, body.content)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Edit classroom message failed:", error)
    const message = error instanceof Error ? error.message : "Unable to edit this message."
    const status = message === "Authentication required." ? 401
      : message.includes("own classroom messages") ? 403
        : message.includes("5,000 characters") || message.includes("Write a message") ? 400 : 500
    return NextResponse.json({ error: status === 500 ? "Unable to edit this message." : message }, { status })
  }
}
