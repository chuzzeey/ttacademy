import { createClient } from './server'

export async function sendMessage(data: {
  title: string
  content: string
  course: string
  sender_name: string
}) {
  const supabase = await createClient()
  
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      title: data.title,
      content: data.content,
      course: data.course.toLowerCase(),
      sender_name: data.sender_name,
    })
    .select()
    .single()

  if (error) throw error
  return message
}

export async function getMessages(course: string) {
  const supabase = await createClient()
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('course', course.toLowerCase())
    .order('created_at', { ascending: true })

  if (error) throw error
  return messages || []
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}