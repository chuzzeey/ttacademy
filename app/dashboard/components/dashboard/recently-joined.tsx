import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { MoreHorizontal } from "lucide-react"

const recentJoined = [
  {
    name: "Enoch Chukwudi",
    course: "Fullstack Development",
    sex: "Male",
    image: "/avatar.png",
  },
  {
    name: "Ngozi Kelechi",
    course: "Fullstack Development",
    sex: "Female",
    image: "/avatar.png",
  },
  {
    name: "John Abel",
    course: "Fullstack Development",
    sex: "Male",
    image: "/avatar.png",
  },
  {
    name: "Wisdom Nnamdi",
    course: "Fullstack Development",
    sex: "Male",
    image: "/avatar.png",
  },
]

export function RecentlyJoined() {
  return (
    <Card className="group bg-card border-border hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
        <CardTitle className="text-base font-medium">Recently Joined Students</CardTitle>
        <span className="text-sm font-medium ml-2">Sex</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentJoined.map((student, index) => (
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
        ))}
      </CardContent>
    </Card>
  )
}
