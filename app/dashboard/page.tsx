import { MetricCard } from "./components/dashboard/metric-card"
import { PageHeader } from "./components/dashboard/page-header"
import { ProfitChart } from "./components/dashboard/profit-chart"
import { MostRegisteredCourses } from "./components/dashboard/most-registered-courses"
import { RecentlyJoined } from "./components/dashboard/recently-joined"
import { RegionalInfo } from "./components/dashboard/regional-info"
import { Button } from "./components/ui/button"
import { Calendar, Upload, DollarSign, ShoppingCart, Users, RotateCcw } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome, Sajibur 👋"
        description="An overview of students insights, and revenue analytics."
      >
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          This Week
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Upload className="w-4 h-4" />
          Export Report
        </Button>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Students" value="$68,837" change="+2.4%" isPositiveOutcome={true} icon={DollarSign} />
        <MetricCard title="Enrolled Students" value="12,485" change="+3.1%" isPositiveOutcome={true} icon={ShoppingCart} />
        <MetricCard title="Total Revenue" value="4,263" change="+1.8%" isPositiveOutcome={true} icon={Users} />
        <MetricCard title="This Week" value="1.5%" change="-0.6%" isPositiveOutcome={true} icon={RotateCcw} />
      </div>

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