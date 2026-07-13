import { createClient } from './server'

export async function getStudentByEmail(email: string) {
  const supabase = await createClient()
  
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .ilike('email', email)
    .single()

  if (error) throw error
  return student
}