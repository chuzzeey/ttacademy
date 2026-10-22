import { TeacherLoginForm } from "@/components/teacher-login-form"

export default async function CourseTeacherLoginPage({
  params,
}: {
  params: Promise<{ course: string }>
}) {
  const { course } = await params
  return <TeacherLoginForm requestedCourse={course} />
}
