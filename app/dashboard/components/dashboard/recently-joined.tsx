"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useStudentStore } from "@/lib/stores/student-store"

const formatCourseName = (course: string) => {
  return course
    .split(/(?<=[a-z])(?=[A-Z])|_|-| /)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function RecentlyJoined() {
  const students = useStudentStore((state) => state.students)

  // Get first 4 newest students from the store
  const recentStudents = students.slice(0, 4).map((s: any) => ({
    name: s.name,
    course: formatCourseName(s.course),
    joined: s.reg_date && s.reg_time ? `${s.reg_date} ${s.reg_time}` : s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A",
    sex: s.sex ? s.sex.charAt(0).toUpperCase() + s.sex.slice(1).toLowerCase() : "N/A",
    image: "/avatar.png",
  }))

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
        <CardTitle className="text-base font-medium">Recently Joined Students</CardTitle>
        <span className="text-sm font-medium ml-2">Joined</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No students yet</p>
        ) : (
          recentStudents.map((student, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                  <img
                    src={student.image || "/placeholder.svg"}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {student.name}
                    <span className="text-xs text-muted-foreground ml-1.5">({student.sex})</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{student.course}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground text-right">{student.joined}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}