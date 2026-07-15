"use client"

import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const revenueComparisonData = [
  { month: "Jan", thisYear: 42000, lastYear: 35000 },
  { month: "Feb", thisYear: 38000, lastYear: 32000 },
  { month: "Mar", thisYear: 45000, lastYear: 38000 },
  { month: "Apr", thisYear: 52000, lastYear: 42000 },
  { month: "May", thisYear: 61000, lastYear: 48000 },
  { month: "Jun", thisYear: 58000, lastYear: 52000 },
]

const salesByCategory = [
  { name: "Electronics", value: 42, color: "#B4D4A5" },
  { name: "Footwear", value: 28, color: "#3D3D3D" },
  { name: "Accessories", value: 18, color: "#6B7280" },
  { name: "Apparel", value: 12, color: "#D1D5DB" },
]

const availableReports = [
  { 
    name: "Monthly Performance Report", 
    description: "Complete breakdown of student performance and enrollment metrics",
    date: "Generated Jan 15, 2026",
    size: "2.4 MB"
  },
  { 
    name: "Revenue Analytics Report", 
    description: "Revenue analysis, trends, and forecasting data",
    date: "Generated Jan 14, 2026",
    size: "1.8 MB"
  },
  { 
    name: "Student Progress Report", 
    description: "Individual student progress and course completion status",
    date: "Generated Jan 13, 2026",
    size: "956 KB"
  },
  { 
    name: "Financial Summary Q4", 
    description: "Revenue, expenses, profit margins, and cash flow",
    date: "Generated Jan 10, 2026",
    size: "3.1 MB"
  },
]

const performanceMetrics = [
  { label: "Enrollment Rate", value: "3.24%", change: "+0.5%", isPositive: true },
  { label: "Avg Session Duration", value: "$127.50", change: "+$12.30", isPositive: true },
  { label: "Dropout Rate", value: "68.2%", change: "-2.1%", isPositive: true },
  { label: "Return Rate", value: "4.8%", change: "+0.3%", isPositive: false },
]

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Generate, view, and download detailed analytics reports."
      >
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          Jan 2026
        </Button>
        <Button className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
          <FileText className="w-4 h-4" />
          Generate Report
        </Button>
      </PageHeader>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
        {performanceMetrics.map((metric) => (
          <Card key={metric.label} className="dashboard-card stat-card">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs text-muted-foreground mb-1.5">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-xl sm:text-2xl font-semibold">{metric.value}</p>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${
                  metric.isPositive ? "text-green-500" : "text-red-500"
                }`}>
                  {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-7">
        {/* Revenue Comparison Chart */}
        <Card className="lg:col-span-2 dashboard-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Revenue Comparison
                </CardTitle>
                <CardDescription>This year vs last year</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">2025</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{ 
                      backgroundColor: "var(--color-card)", 
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--color-foreground)"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lastYear" 
                    stroke="var(--color-muted-foreground)" 
                    fill="var(--color-muted)" 
                    strokeWidth={2}
                    name="2025"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="thisYear" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.15}
                    strokeWidth={2}
                    name="2026"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Sales by Category
            </CardTitle>
            <CardDescription>Distribution of revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {salesByCategory.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, ""]}
                    contentStyle={{ 
                      backgroundColor: "var(--color-card)", 
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--color-foreground)"
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {salesByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-muted-foreground truncate">{cat.name}</span>
                  <span className="text-xs font-medium ml-auto">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Available Reports</CardTitle>
              <CardDescription>Download or schedule automated reports</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent">
              View All Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableReports.map((report) => (
              <div 
                key={report.name} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.date}
                      </span>
                      <span className="text-xs text-muted-foreground">{report.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent flex items-center gap-2 shrink-0">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}