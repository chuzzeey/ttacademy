"use client"

import { MetricCard } from "./components/dashboard/metric-card"
import { PageHeader } from "./components/dashboard/page-header"
import { ProfitChart } from "./components/dashboard/profit-chart"
import { MostRegisteredCourses } from "./components/dashboard/most-registered-courses"
import { RecentlyJoined } from "./components/dashboard/recently-joined"
import { RegionalInfo } from "./components/dashboard/regional-info"
import { Button } from "./components/ui/button"
import { useState } from "react"
import { Upload, Users, AlertCircle, DollarSign, Calendar } from "lucide-react"

export default function DashboardPage() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <PageHeader
        title="Welcome, Sajibur 👋"
        description="An overview of students insights, and revenue analytics."
      >
        <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={() => setShowPopup(true)}>
          <Upload className="w-4 h-4" />
          Export Report
        </Button>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Students" value="68" icon={Users} description="Total registrations" />
        <MetricCard title="Enrolled Students" value="12" icon={AlertCircle} description="Acquisition needs attention" />
        <MetricCard title="Total Revenue" value="₦400,263" icon={DollarSign} description="Total revenue collected" />
        <MetricCard title="This Week" value="5" icon={Calendar} description="Students registered this week" />
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm">
            <p className="text-sm font-medium">Feature coming soon!</p>
            <Button className="mt-4 w-full" onClick={() => setShowPopup(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        <div>
          <RecentlyJoined />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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