import { NextRequest, NextResponse } from "next/server"
import { setMessagePinned } from "@/lib/supabase/messages"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    if (
      typeof body.messageId !== "string"
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.messageId)
      || typeof body.isPinned !== "boolean"
    ) {
      return NextResponse.json({ error: "Choose a message and pin state." }, { status: 400 })
    }
    const data = await setMessagePinned(body.messageId, body.isPinned)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Pin classroom message failed:", error)
    const message = error instanceof Error ? error.message : "Unable to update the pinned message."
    const status = message === "Authentication required." ? 401
      : message.includes("teachers and admins") ? 403 : 500
    return NextResponse.json({ error: status === 500 ? "Unable to update the pinned message." : message }, { status })
  }
}
