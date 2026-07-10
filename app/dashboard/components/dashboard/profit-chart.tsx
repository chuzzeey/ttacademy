"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

const data = [
  { month: "Sun 5", joined: 10, enrolled: 30 },
  { month: "Mon 6", joined: 12, enrolled: 36 },
  { month: "Tue 7", joined: 14, enrolled: 42 },
  { month: "Wed 8", joined: 11, enrolled: 33 },
  { month: "Thu 9", joined: 11, enrolled: 33 },
  { month: "Fri 10", joined: 10, enrolled: 30 },
]

export function ProfitChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Revenue  Overview</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-semibold">₦98,643.24</span>
            <span className="text-xs bg-[var(--color-accent)]/30 text-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
              +8.4%
              <span className="text-[10px]">↗</span>
            </span>
          </div>
        </div>
       
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-chart-gray)]" />
            <span className="text-xs text-muted-foreground">Total Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-chart-orange)]" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={-1}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#737373" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#737373" }}
                ticks={[10, 20, 30, 40]}
                tickFormatter={(value) => `${value}`}
                domain={[0, 50]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "joined" ? value.toLocaleString() : `₦${(value * 50000).toLocaleString()}`,
                  name === "joined" ? "Joined" : "Revenue",
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="joined" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`joined-${index}`} fill="#e5e5e5" />
                ))}
              </Bar>
              <Bar dataKey="enrolled" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`enrolled-${index}`} fill={entry.enrolled === 0 ? "#fef3c7" : "#fdba74"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
