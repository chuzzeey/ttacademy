import { NextRequest, NextResponse } from "next/server"
import { toggleMessageReaction } from "@/lib/supabase/messages"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (typeof body.messageId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.messageId) || typeof body.emoji !== "string") {
      return NextResponse.json({ error: "Choose a message and reaction." }, { status: 400 })
    }
    const data = await toggleMessageReaction(body.messageId, body.emoji)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Classroom message reaction failed:", error)
    const message = error instanceof Error ? error.message : "Unable to update this reaction."
    const status = message === "Authentication required." ? 401
      : message === "Choose a supported reaction." ? 400 : 500
    return NextResponse.json({ error: status === 500 ? "Unable to update this reaction." : message }, { status })
  }
}
