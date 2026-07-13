"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useStudentStore } from "@/lib/stores/student-store"

interface ChartData {
  date: string
  joined: number
  enrolled: number
  revenue: number
}

export function ProfitChart() {
  const students = useStudentStore((state) => state.students)

  const { chartData, totalRevenue, percentageChange } = useMemo(() => {
    if (students.length === 0) {
      return { chartData: [] as ChartData[], totalRevenue: "₦0", percentageChange: "0.0" }
    }

    // Get last 12 days
    const data: ChartData[] = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Filter students for this date
      const dayStudents = students.filter((s: any) => {
        if (!s.created_at) return false
        const regDate = new Date(s.created_at).toISOString().split('T')[0]
        return regDate === date.toISOString().split('T')[0]
      })

      const joined = dayStudents.length
      const enrolled = dayStudents.filter((s: any) => s.payment_status && s.payment_status !== "Not Paid").length
      
      const revenue = dayStudents.reduce((sum: number, s: any) => {
        if (s.payment_status === "Fully Paid") return sum + 50000
        if (s.payment_status === "1st Installment" || s.payment_status === "2nd Installment") return sum + 25000
        return sum
      }, 0)

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        joined,
        enrolled,
        revenue,
      })
    }

    // Calculate total revenue
    const totalRev = students.reduce((sum: number, s: any) => {
      if (s.payment_status === "Fully Paid") return sum + 50000
      if (s.payment_status === "1st Installment" || s.payment_status === "2nd Installment") return sum + 25000
      return sum
    }, 0)

    // Calculate percentage change
    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint)
    const secondHalf = data.slice(midpoint)
    const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.revenue, 0)
    const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.revenue, 0)
    const change = firstHalfTotal > 0 ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal * 100).toFixed(1) : "0.0"

    return { chartData: data, totalRevenue: `₦${totalRev.toLocaleString()}`, percentageChange: change }
  }, [students])

  const isPositive = parseFloat(percentageChange) >= 0

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-semibold">{totalRevenue}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${isPositive ? "bg-amber-500/30 text-foreground" : "bg-red-500/30 text-foreground"}`}>
              {isPositive ? "+" : ""}{percentageChange}%
              <span className="text-[10px]">{isPositive ? "↗" : "↘"}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">Total Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={-1}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                domain={[0, 50]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-foreground)",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "joined" ? value.toLocaleString() : `₦${(value * 50000).toLocaleString()}`,
                  name === "joined" ? "Joined" : "Revenue",
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="joined" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`joined-${index}`} fill="var(--color-muted-foreground)" fillOpacity={0.2} />
                ))}
              </Bar>
              <Bar dataKey="enrolled" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`enrolled-${index}`} fill="#f59e0b" fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}