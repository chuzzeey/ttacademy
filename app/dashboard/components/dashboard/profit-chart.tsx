"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ChartData {
  date: string
  joined: number
  enrolled: number
  revenue: number
}

export function ProfitChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [totalRevenue, setTotalRevenue] = useState("₦0")
  const [percentageChange, setPercentageChange] = useState("0.0")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/registrations")
        const json = await res.json()
        if (json.data) {
          const students = json.data

          // Get last 12 days
          const data: ChartData[] = []
          const today = new Date()
          
          for (let i = 11; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            
            // Filter students for this date
            const dayStudents = students.filter((s: any) => {
              if (!s.createdAt) return false
              const regDate = new Date(s.createdAt).toISOString().split('T')[0]
              return regDate === dateStr
            })

            const joined = dayStudents.length
            const enrolled = dayStudents.filter((s: any) => s.payment_status && s.payment_status !== "Not Paid").length
            
            // Calculate revenue for this day
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

          setChartData(data)

          // Calculate total revenue
          const totalRev = students.reduce((sum: number, s: any) => {
            if (s.payment_status === "Fully Paid") return sum + 50000
            if (s.payment_status === "1st Installment" || s.payment_status === "2nd Installment") return sum + 25000
            return sum
          }, 0)
          setTotalRevenue(`₦${totalRev.toLocaleString()}`)

          // Calculate percentage change (compare first half to second half)
          const midpoint = Math.floor(data.length / 2)
          const firstHalf = data.slice(0, midpoint)
          const secondHalf = data.slice(midpoint)

          const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.revenue, 0)
          const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.revenue, 0)

          if (firstHalfTotal > 0) {
            const change = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal * 100).toFixed(1)
            setPercentageChange(change)
          }
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const isPositive = parseFloat(percentageChange) >= 0

  if (loading) {
    return (
    <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Loading...</p>
          </div>
        </CardHeader>
      </Card>
    )
  }

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
                ticks={[10, 20, 30, 40]}
                tickFormatter={(value) => `${value}`}
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