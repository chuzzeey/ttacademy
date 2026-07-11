"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { MoreHorizontal } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface CourseData {
  month: string
  orders: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function MostRegisteredCourses() {
  const [topCourseCount, setTopCourseCount] = useState(0)
  const [chartData, setChartData] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/registrations")
        const json = await res.json()
        if (json.data) {
          const students = json.data

          // Count courses
          const courseCount: Record<string, number> = {}
          students.forEach((s: any) => {
            const course = s.course || "Unknown"
            courseCount[course] = (courseCount[course] || 0) + 1
          })

          // Get top course count
          const maxCount = Math.max(...Object.values(courseCount), 0)
          setTopCourseCount(maxCount)

          // Count registrations by month for current year
          const monthlyCount: Record<number, number> = {}
          const currentYear = new Date().getFullYear()
          
          students.forEach((s: any) => {
            if (s.createdAt) {
              const regDate = new Date(s.createdAt)
              if (regDate.getFullYear() === currentYear) {
                const month = regDate.getMonth()
                monthlyCount[month] = (monthlyCount[month] || 0) + 1
              }
            }
          })

          // Generate chart data for last 6 months
          const data: CourseData[] = []
          const now = new Date()
          const currentMonth = now.getMonth()
          
          for (let i = 5; i >= 0; i--) {
            const monthIndex = currentMonth - i
            const actualMonth = monthIndex < 0 ? monthIndex + 12 : monthIndex
            data.push({
              month: MONTHS[actualMonth],
              orders: monthlyCount[actualMonth] || 0,
            })
          }

          setChartData(data)
        }
      } catch (err) {
        console.error("Failed to fetch course data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate percentage change (compare last 2 months)
  const getPercentageChange = () => {
    if (chartData.length < 2) return { percent: "0.0", change: 0 }
    const lastMonth = chartData[chartData.length - 1].orders
    const prevMonth = chartData[chartData.length - 2].orders
    if (prevMonth === 0) return { percent: "0.0", change: lastMonth }
    const change = lastMonth - prevMonth
    const percent = prevMonth > 0 ? ((change / prevMonth) * 100).toFixed(1) : "0.0"
    return { percent, change }
  }

  const { percent, change } = getPercentageChange()
  const isPositive = change >= 0

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Top Registered Courses </CardTitle>
          <p className="text-xs text-muted-foreground">1 Jan - 12 Dec 2026</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-3xl font-semibold">{loading ? "..." : topCourseCount}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${isPositive ? "bg-amber-500/30 text-foreground" : "bg-red-500/30 text-foreground"}`}>
              {isPositive ? "+" : ""}{percent}% {isPositive ? "↗" : "↘"}
            </span>
            <span className="text-xs text-muted-foreground">{isPositive ? "+" : ""}{change}</span>
          </div>
        </div>
        <div className="h-[120px]">
          {!loading && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--color-foreground)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Registrations"]}
                />
                <Area type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} fill="url(#orderGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}