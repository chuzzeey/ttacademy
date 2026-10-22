import { createClient } from "./server"

type MessageInput = {
  content: string
  course: string
  attachmentPath?: string
  attachmentName?: string
  attachmentMimeType?: string
}

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
    })
    .select("id,content,course_slug,sender_name,sender_role,created_at,attachment_path,attachment_name,attachment_mime_type")
    .single()

  if (error) throw error
  return {
    ...data,
    title: data.sender_role === "teacher" ? "Mentor" : data.sender_role,
    course: data.course_slug,
  }
}

export async function getMessages(course: string) {
  const { supabase } = await getClassroomIdentity(course)
  const { data, error } = await supabase
    .from("classroom_messages")
    .select("id,content,course_slug,sender_name,sender_role,created_at,attachment_path,attachment_name,attachment_mime_type")
    .eq("course_slug", course)
    .order("created_at", { ascending: true })
    .limit(250)

  if (error) throw error
  return data.map((message) => ({
    ...message,
    title: message.sender_role === "teacher" ? "Mentor" : message.sender_role,
    course: message.course_slug,
  }))
}

export async function deleteMessage(messageId: string) {
  const { supabase, user } = await getClassroomIdentityForMessage(messageId)
  const { error } = await supabase
    .from("classroom_messages")
    .delete()
    .eq("id", messageId)
    .eq("sender_user_id", user.id)
  if (error) throw error
}

async function getClassroomIdentityForMessage(messageId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")
  const { data: message, error } = await supabase
    .from("classroom_messages")
    .select("course_slug,sender_user_id")
    .eq("id", messageId)
    .maybeSingle()
  if (error) throw error
  if (!message || message.sender_user_id !== user.id) throw new Error("You can only delete your own message.")
  const { data: role, error: roleError } = await supabase.rpc("classroom_user_role", {
    p_course_slug: message.course_slug,
  })
  if (roleError) throw roleError
  if (!role) throw new Error("You do not have access to this classroom.")
  return { supabase, user }
}
