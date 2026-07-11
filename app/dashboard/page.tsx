"use client"

import { useState, useEffect, useRef } from "react"
import { MetricCard } from "./components/dashboard/metric-card"
import { PageHeader } from "./components/dashboard/page-header"
import { ProfitChart } from "./components/dashboard/profit-chart"
import { MostRegisteredCourses } from "./components/dashboard/most-registered-courses"
import { RecentlyJoined } from "./components/dashboard/recently-joined"
import { RegionalInfo } from "./components/dashboard/regional-info"
import { Button } from "./components/ui/button"
import { Users, AlertCircle, DollarSign, Calendar, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const [showPopup, setShowPopup] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [timeAgo, setTimeAgo] = useState("")
  const lastUpdatedRef = useRef<Date | null>(null)
  const [totalStudents, setTotalStudents] = useState("0")
  const [enrolledStudents, setEnrolledStudents] = useState("0")
  const [totalRevenue, setTotalRevenue] = useState("₦0")
  const [thisWeek, setThisWeek] = useState("0")

  const updateTimeAgo = () => {
    const date = lastUpdatedRef.current
    if (!date) return
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 10) {
      setTimeAgo("Just now")
    } else if (diffInSeconds < 60) {
      setTimeAgo(`${diffInSeconds}s ago`)
    } else if (diffInSeconds < 120) {
      setTimeAgo("1m ago")
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      setTimeAgo(`${minutes}m ago`)
    } else if (diffInSeconds < 7200) {
      setTimeAgo("1h ago")
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      setTimeAgo(`${hours}h ago`)
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      setTimeAgo(`${days}d ago`)
    }
  }

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/registrations")
      const json = await res.json()
      if (json.data) {
        const students = json.data
        const total = students.length
        
        // Count enrolled students (not "Not Paid")
        const enrolled = students.filter((s: any) => s.payment_status && s.payment_status !== "Not Paid").length
        
        // Calculate total revenue based on payment status
        const revenue = students.reduce((sum: number, s: any) => {
          if (s.payment_status === "Fully Paid") return sum + 50000
          if (s.payment_status === "1st Installment" || s.payment_status === "2nd Installment") return sum + 25000
          return sum
        }, 0)
        
        // Count students registered this week
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        weekStart.setHours(0, 0, 0, 0)
        
        const thisWeekCount = students.filter((s: any) => {
          if (!s.createdAt) return false
          const regDate = new Date(s.createdAt)
          return regDate >= weekStart
        }).length

        setTotalStudents(total.toString())
        setEnrolledStudents(enrolled.toString())
        setTotalRevenue(`₦${revenue.toLocaleString()}`)
        setThisWeek(thisWeekCount.toString())
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMetrics()
    const now = new Date()
    lastUpdatedRef.current = now
    updateTimeAgo()
    setTimeout(() => setRefreshing(false), 500)
  }

  useEffect(() => {
    fetchMetrics()
    const now = new Date()
    lastUpdatedRef.current = now
    updateTimeAgo()
    
    // Update time ago every 10 seconds
    const interval = setInterval(() => {
      updateTimeAgo()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <PageHeader
        title='Welcome, Precious <span class="animate-wave">👋</span>'
        description="An overview of students insights, and revenue analytics."
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {timeAgo && <span>Last updated: {timeAgo}</span>}
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={() => setShowPopup(true)}>
          Export Report
        </Button>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <MetricCard title="Total Students" value={totalStudents} icon={Users} description="Total registrations" />
        <MetricCard title="Enrolled Students" value={enrolledStudents} icon={AlertCircle} description="Acquisition needs attention" />
        <MetricCard title="Total Revenue" value={totalRevenue} icon={DollarSign} description="Total revenue collected" />
        <MetricCard title="This Week" value={thisWeek} icon={Calendar} description="Students registered this week" />
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[80]">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm">
            <p className="text-sm font-medium">Feature coming soon!</p>
            <Button className="mt-4 w-full" onClick={() => setShowPopup(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        <div>
          <RecentlyJoined />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="h-full">
          <MostRegisteredCourses />
        </div>
        <div className="lg:col-span-2 h-full">
          <RegionalInfo />
        </div>
      </div>
    </>
  )
}