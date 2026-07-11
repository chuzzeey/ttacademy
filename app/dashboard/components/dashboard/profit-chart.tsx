"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const data = [
  { month: "Sun", joined: 10, enrolled: 30 },
  { month: "Mon", joined: 12, enrolled: 36 },
  { month: "Tue", joined: 14, enrolled: 42 },
  { month: "Wed", joined: 11, enrolled: 33 },
  { month: "Thu", joined: 11, enrolled: 33 },
  { month: "Fri", joined: 10, enrolled: 30 },
  { month: "Sun", joined: 9, enrolled: 27 },
  { month: "Mon", joined: 13, enrolled: 39 },
  { month: "Tue", joined: 15, enrolled: 45 },
  { month: "Wed", joined: 12, enrolled: 36 },
  { month: "Thu", joined: 10, enrolled: 30 },
  { month: "Fri", joined: 11, enrolled: 33 },
]

export function ProfitChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Revenue  Overview</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-semibold">₦98,643.24</span>
            <span className="text-xs bg-amber-500/30 text-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
              +8.4%
              <span className="text-[10px]">↗</span>
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
            <BarChart data={data} barGap={-1}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
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
                {data.map((entry, index) => (
                  <Cell key={`joined-${index}`} fill="var(--color-muted-foreground)" fillOpacity={0.2} />
                ))}
              </Bar>
              <Bar dataKey="enrolled" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`enrolled-${index}`} fill="var(--color-chart-1)" fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
