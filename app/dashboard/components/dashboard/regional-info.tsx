"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#ef4444", "#14b8a6", "#eab308", "#ec4899"]

interface RegionData {
  country: string
  value: number
  color: string
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: RegionData }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card px-3 py-2 rounded-lg shadow-lg text-xs font-medium border border-border">
        <p className="font-semibold">{data.country}</p>
        <p style={{ color: data.color }}>{data.value} student{data.value !== 1 ? "s" : ""}</p>
      </div>
    )
  }
  return null
}

export function RegionalInfo() {
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [topRegion, setTopRegion] = useState("")
  const [topRegionCount, setTopRegionCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/registrations")
        const json = await res.json()
        if (json.data) {
          // Count students by country
          const countryCount: Record<string, number> = {}
          json.data.forEach((s: any) => {
            const country = s.country || "Unknown"
            countryCount[country] = (countryCount[country] || 0) + 1
          })

          // Sort by count descending, take top 8
          const sorted = Object.entries(countryCount)
            .sort(([, a], [, b]) => b - a)

          const total = json.data.length
          setTotalStudents(total)

          // Set top region
          if (sorted.length > 0) {
            setTopRegion(sorted[0][0])
            setTopRegionCount(sorted[0][1])
          }

          // Map to chart data with colors
          const chartData = sorted.slice(0, 8).map(([country, value], index) => ({
            country,
            value,
            color: COLORS[index % COLORS.length],
          }))

          setRegionData(chartData)
        }
      } catch (err) {
        console.error("Failed to fetch regional data:", err)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="group bg-card border-border hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 h-full">
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
              <p className="text-2xl font-semibold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">{topRegion}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-semibold text-[var(--color-positive)]">+34%</p>
              <p className="text-xs text-muted-foreground">{topRegion} and {regionData.length > 1 ? regionData[1].country : "others"}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex flex-col">
            <div className="h-[180px]">
              {regionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {regionData.map((item) => (
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