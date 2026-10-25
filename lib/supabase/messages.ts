import { createClient } from "./server"

type MessageInput = {
  content: string
  course: string
  attachmentPath?: string
  attachmentName?: string
  attachmentMimeType?: string
  replyToMessageId?: string
}

const allowedReactions = new Set(["👍", "❤️", "😂", "😮", "😢", "🙏", "👏", "🔥", "🎉", "💯"])

async function getClassroomIdentity(course: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const { data: role, error: roleError } = await supabase.rpc("classroom_user_role", {
    p_course_slug: course,
  })
  if (roleError) throw roleError
  if (!role || !["admin", "teacher", "student"].includes(role)) {
    throw new Error("You do not have access to this classroom.")
  }

  const { data: name, error: nameError } = await supabase.rpc("classroom_user_name", {
    p_course_slug: course,
  })
  if (nameError) throw nameError
  return { supabase, user, role, name: typeof name === "string" ? name : user.email ?? "Classroom member" }
}

export async function sendMessage(input: MessageInput) {
  const content = input.content.trim()
  if (!content && !input.attachmentPath) throw new Error("Write a message or attach a file.")
  if (content.length > 5000) throw new Error("Messages must be 5,000 characters or fewer.")

  const { supabase, user, role, name } = await getClassroomIdentity(input.course)
  if (input.attachmentPath && !input.attachmentPath.startsWith(`${input.course}/${user.id}/`)) {
    throw new Error("The attachment path is invalid for this classroom.")
  }
  if (input.replyToMessageId) {
    const { data: parent, error: parentError } = await supabase
      .from("classroom_messages")
      .select("id")
      .eq("id", input.replyToMessageId)
      .eq("course_slug", input.course)
      .maybeSingle()
    if (parentError) throw parentError
    if (!parent) throw new Error("The message you are replying to is unavailable.")
  }

  const { data, error } = await supabase
    .from("classroom_messages")
    .insert({
      course_slug: input.course,
      sender_user_id: user.id,
      sender_role: role,
      sender_name: name,
      content,
      attachment_path: input.attachmentPath ?? null,
      attachment_name: input.attachmentName ?? null,
      attachment_mime_type: input.attachmentMimeType ?? null,
      reply_to_message_id: input.replyToMessageId ?? null,
    })
    .select("id,sender_user_id,content,course_slug,sender_name,sender_role,created_at,attachment_path,attachment_name,attachment_mime_type,reply_to_message_id,edited_at")
    .single()

  if (error) throw error
  return {
    ...data,
    title: data.sender_role === "teacher" ? "Mentor" : data.sender_role,
    course: data.course_slug,
  }
}

export async function getMessages(course: string) {
  const { supabase, user } = await getClassroomIdentity(course)
  const { data, error } = await supabase
    .from("classroom_messages")
    .select("id,sender_user_id,content,course_slug,sender_name,sender_role,created_at,attachment_path,attachment_name,attachment_mime_type,reply_to_message_id,edited_at,is_pinned")
    .eq("course_slug", course)
    .order("created_at", { ascending: true })
    .limit(250)

  if (error) throw error
  const parentIds = [...new Set(data.map((message) => message.reply_to_message_id).filter((id): id is string => Boolean(id)))]
  const [reactionResult, parentResult] = await Promise.all([
    data.length
      ? supabase.from("classroom_message_reactions").select("message_id,user_id,emoji").in("message_id", data.map((message) => message.id))
      : Promise.resolve({ data: [], error: null }),
    parentIds.length
      ? supabase.from("classroom_messages").select("id,content,sender_name").in("id", parentIds)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (reactionResult.error) throw reactionResult.error
  if (parentResult.error) throw parentResult.error

  const reactionsByMessage = new Map<string, Array<{ emoji: string; count: number; reacted: boolean }>>()
  for (const reaction of reactionResult.data ?? []) {
    const reactions = reactionsByMessage.get(reaction.message_id) ?? []
    const existing = reactions.find((item) => item.emoji === reaction.emoji)
    if (existing) {
      existing.count += 1
      existing.reacted ||= reaction.user_id === user.id
    } else {
      reactions.push({ emoji: reaction.emoji, count: 1, reacted: reaction.user_id === user.id })
    }
    reactionsByMessage.set(reaction.message_id, reactions)
  }

  const parents = new Map((parentResult.data ?? []).map((parent) => [parent.id, parent]))
  return data.map((message) => ({
    ...message,
    reply_to: message.reply_to_message_id ? parents.get(message.reply_to_message_id) ?? null : null,
    reactions: reactionsByMessage.get(message.id) ?? [],
    title: message.sender_role === "teacher" ? "Mentor" : message.sender_role,
    course: message.course_slug,
  }))
}

export async function editMessage(messageId: string, content: string) {
  const normalizedContent = content.trim()
  if (!normalizedContent) throw new Error("Write a message before saving.")
  if (normalizedContent.length > 5000) throw new Error("Messages must be 5,000 characters or fewer.")
  const { supabase, user } = await getClassroomIdentityForMessage(messageId, true)
  const { data, error } = await supabase
    .from("classroom_messages")
    .update({ content: normalizedContent, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("sender_user_id", user.id)
    .select("id,content,edited_at")
    .single()
  if (error) throw error
  return data
}

export async function toggleMessageReaction(messageId: string, emoji: string) {
  if (!allowedReactions.has(emoji)) throw new Error("Choose a supported reaction.")
  const { supabase, user } = await getClassroomIdentityForMessage(messageId)
  const { data: existing, error: lookupError } = await supabase
    .from("classroom_message_reactions")
    .select("emoji")
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (lookupError) throw lookupError

  if (existing?.emoji === emoji) {
    const { error } = await supabase
      .from("classroom_message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("user_id", user.id)
    if (error) throw error
    return { active: false }
  }

  const { error } = existing
    ? await supabase
      .from("classroom_message_reactions")
      .update({ emoji })
      .eq("message_id", messageId)
      .eq("user_id", user.id)
    : await supabase
      .from("classroom_message_reactions")
      .insert({ message_id: messageId, user_id: user.id, emoji })
  if (error) throw error
  return { active: true }
}

export async function setMessagePinned(messageId: string, isPinned: boolean) {
  const { supabase, user, role, message } = await getClassroomIdentityForMessage(messageId)
  if (role !== "admin" && role !== "teacher") {
    throw new Error("Only classroom teachers and admins can pin messages.")
  }

  const { data, error } = await supabase
    .from("classroom_messages")
    .update({
      is_pinned: isPinned,
      pinned_at: isPinned ? new Date().toISOString() : null,
      pinned_by: isPinned ? user.id : null,
    })
    .eq("id", messageId)
    .eq("course_slug", message.course_slug)
    .select("id,is_pinned,pinned_at,pinned_by")
    .single()
  if (error) throw error
  return data
}

export async function deleteMessage(messageId: string) {
  const { supabase, user } = await getClassroomIdentityForMessage(messageId, true)
  const { error } = await supabase
    .from("classroom_messages")
    .delete()
    .eq("id", messageId)
    .eq("sender_user_id", user.id)
  if (error) throw error
}

async function getClassroomIdentityForMessage(messageId: string, requireOwner = false) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")
  const { data: message, error } = await supabase
    .from("classroom_messages")
    .select("course_slug,sender_user_id")
    .eq("id", messageId)
    .maybeSingle()
  if (error) throw error
  if (!message) throw new Error("This classroom message is unavailable.")
  if (requireOwner && message.sender_user_id !== user.id) {
    throw new Error("You can only change your own classroom messages.")
  }
  const identity = await getClassroomIdentity(message.course_slug)
  return { supabase, user, role: identity.role, message }
}
