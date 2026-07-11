"use client"

import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, CreditCard } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Line, LineChart } from "recharts"
import Image from "next/image"

const studentsData = [
  { month: "Jan", joined: 32, enrolled: 42 },
  { month: "Feb", joined: 28, enrolled: 38 },
  { month: "Mar", joined: 45, enrolled: 55 },
  { month: "Apr", joined: 52, enrolled: 62 },
  { month: "May", joined: 73, enrolled: 87 },
  { month: "Jun", joined: 58, enrolled: 68 },
  { month: "Jul", joined: 42, enrolled: 52 },
  { month: "Aug", joined: 48, enrolled: 58 },
  { month: "Sep", joined: 55, enrolled: 65 },
  { month: "Oct", joined: 62, enrolled: 72 },
  { month: "Nov", joined: 68, enrolled: 78 },
  { month: "Dec", joined: 75, enrolled: 85 },
]

const topStudents = [
  { name: "Enoch Chukwudi", course: "Fullstack Development", grade: "A", sales: 95, image: "/avatar.png" },
  { name: "Ngozi Kelechi", course: "Fullstack Development", grade: "A+", sales: 98, image: "/avatar.png" },
  { name: "John Abel", course: "Fullstack Development", grade: "B+", sales: 88, image: "/avatar.png" },
  { name: "Wisdom Nnamdi", course: "Fullstack Development", grade: "A-", sales: 92, image: "/avatar.png" },
]

const studentsByCourse = [
  { course: "Fullstack Development", students: 45200, percentage: 38 },
  { course: "Frontend Development", students: 35800, percentage: 30 },
  { course: "Backend Development", students: 24500, percentage: 20 },
  { course: "UI/UX Design", students: 14500, percentage: 12 },
]

export default function StudentsPage() {
  return (
    <>
      <PageHeader
        title="Students Analytics"
        description="Track your students performance and metrics."
      >
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          This Year
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </PageHeader>

      {/* Students Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Students</span>
              <div className="p-2 bg-muted rounded-lg">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-3xl font-semibold">0</p>
            <p className="text-xs text-[var(--color-positive)] mt-1">+12.5%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total registrations</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Enrolled Students</span>
              <div className="p-2 bg-muted rounded-lg">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-3xl font-semibold">0</p>
            <p className="text-xs text-[var(--color-negative)] mt-1">-20%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Acquisition needs attention</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <div className="p-2 bg-muted rounded-lg">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-3xl font-semibold">₦0</p>
            <p className="text-xs text-[var(--color-positive)] mt-1">+12.5%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total revenue collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Students Enrollment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                    formatter={(value: number) => [value.toLocaleString(), ""]}
                  />
                  <Bar dataKey="joined" fill="#B4D4A5" radius={[4, 4, 0, 0]} name="Joined" />
                  <Bar dataKey="enrolled" fill="#F97316" radius={[4, 4, 0, 0]} name="Enrolled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Students by Course */}
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Students by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentsByCourse.map((item) => (
                <div key={item.course}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.course}</span>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-accent)] rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.students.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Students Table */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Performing Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Course</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Score</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student) => (
                  <tr key={student.name} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                          <Image src={student.image || "/placeholder.svg"} alt={student.name} width={40} height={40} className="object-cover" />
                        </div>
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{student.course}</td>
                    <td className="py-3 px-2 text-sm text-right">{student.grade}</td>
                    <td className="py-3 px-2 text-sm text-right">{student.sales}%</td>
                    <td className="py-3 px-2 text-sm text-right font-medium">
                      {student.sales}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}