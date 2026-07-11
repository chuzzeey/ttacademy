"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { MoreHorizontal } from "lucide-react"

interface RecentStudent {
  name: string
  course: string
  sex: string
  image: string
}

  const formatCourseName = (course: string) => {
    return course
      .split(/(?<=[a-z])(?=[A-Z])|_|-| /)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  }

export function RecentlyJoined() {
  const [students, setStudents] = useState<RecentStudent[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchRecentStudents = async () => {
      try {
        const res = await fetch("/api/registrations")
        const json = await res.json()
        if (json.data && isMounted) {
          const mapped = json.data.map((s: any) => ({
            name: s.name,
            course: formatCourseName(s.course),
            sex: s.sex ? s.sex.charAt(0).toUpperCase() + s.sex.slice(1).toLowerCase() : "N/A",
            image: "/avatar.png",
          }))
          // Get first 4 (API returns newest first)
          setStudents(mapped.slice(0, 4))
        }
      } catch (err) {
        console.error("Failed to fetch recent students:", err)
      }
    }
    fetchRecentStudents()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Card className="group bg-card border-border hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
        <CardTitle className="text-base font-medium">Recently Joined Students</CardTitle>
        <span className="text-sm font-medium ml-2">Sex</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : (
          students.map((student, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                  <img
                    src={student.image || "/placeholder.svg"}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.course}</p>
                </div>
              </div>
              <span className="text-sm font-medium">{student.sex}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}