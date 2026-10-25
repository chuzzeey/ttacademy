export type ClassroomMessageRecord = {
  id: string
  sender_user_id: string
  content: string
  sender_name: string
  sender_role: "admin" | "teacher" | "student"
  course_slug: string
  created_at: string
  attachment_path: string | null
  attachment_name: string | null
  attachment_mime_type: string | null
  reply_to_message_id?: string | null
  reply_to?: { id: string; content: string; sender_name: string } | null
  edited_at?: string | null
  is_pinned?: boolean
  reactions?: Array<{ emoji: string; count: number; reacted: boolean }>
}

export function mapClassroomMessage(
  message: ClassroomMessageRecord,
  userId: string | null,
  view: "student" | "teacher",
) {
  const isMine = Boolean(userId && message.sender_user_id === userId)
  const sender: "me" | "mentor" | "student" = isMine
    ? "me"
    : view === "student" && (message.sender_role === "admin" || message.sender_role === "teacher")
      ? "mentor"
      : "student"

  return {
    id: message.id,
    text: message.content,
    timestamp: new Date(message.created_at),
    status: "read" as const,
    sender,
    senderUserId: message.sender_user_id,
    senderName: message.sender_name,
    attachmentPath: message.attachment_path ?? undefined,
    attachmentName: message.attachment_name ?? undefined,
    attachmentMimeType: message.attachment_mime_type ?? undefined,
    replyToMessageId: message.reply_to_message_id ?? undefined,
    replyTo: message.reply_to ?? undefined,
    editedAt: message.edited_at ?? undefined,
    isPinned: message.is_pinned ?? false,
    reactions: message.reactions ?? [],
  }
}
