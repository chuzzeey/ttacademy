"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const countryData = [
  { country: "Owerri", value: 1245680, color: "#3b82f6" },
  { country: "Lagos", value: 684320, color: "#22c55e" },
  { country: "Abia", value: 312450, color: "#8b5cf6" },
  { country: "Anambra", value: 158970, color: "#f97316" },
]

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof countryData[0] }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card px-3 py-2 rounded-lg shadow-lg text-xs font-medium border border-border">
        <p className="font-semibold">{data.country}</p>
        <p style={{ color: data.color }}>₦{data.value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export function RegionalInfo() {
  const total = countryData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="group bg-card border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Student Registration Regions</CardTitle>
          <p className="text-xs text-muted-foreground">Regional Registration Distribution</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Stats panel */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Top Performing Regions</p>
              <p className="text-2xl font-semibold">68</p>
              <p className="text-xs text-muted-foreground">Owerri</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-semibold text-[var(--color-positive)]">+34%</p>
              <p className="text-xs text-muted-foreground">Owerri and Lagos</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold">₦{total.toLocaleString()}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex flex-col">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {countryData.map((item) => (
                <div key={item.country} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{item.country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
