"use client"

import { useState, Suspense } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Search, Plus, Users, UserPlus, UserCheck, Mail } from "lucide-react"
import Loading from "./loading"

const payments = [
  { id: 1, student: "Enoch Chukwudi", course: "Fullstack Development", amount: "₦250,000", status: "Completed", date: "Jan 15, 2024", method: "Bank Transfer" },
  { id: 2, student: "Ngozi Kelechi", course: "Frontend Development", amount: "₦180,000", status: "Completed", date: "Jan 14, 2024", method: "PayPal" },
  { id: 3, student: "John Abel", course: "Backend Development", amount: "₦320,000", status: "Processing", date: "Jan 14, 2024", method: "Credit Card" },
  { id: 4, student: "Wisdom Nnamdi", course: "Fullstack Development", amount: "₦250,000", status: "Completed", date: "Jan 13, 2024", method: "Bank Transfer" },
  { id: 5, student: "Sarah Johnson", course: "UI/UX Design", amount: "₦150,000", status: "Pending", date: "Jan 13, 2024", method: "PayPal" },
  { id: 6, student: "Michael Chen", course: "Frontend Development", amount: "₦180,000", status: "Completed", date: "Jan 12, 2024", method: "Bank Transfer" },
  { id: 7, student: "Emma Wilson", course: "Data Science", amount: "₦400,000", status: "Completed", date: "Jan 12, 2024", method: "Credit Card" },
  { id: 8, student: "James Brown", course: "Backend Development", amount: "₦320,000", status: "Failed", date: "Jan 11, 2024", method: "PayPal" },
]

const paymentSegments = [
  { name: "Completed", count: 1245, percentage: 65, color: "bg-green-500" },
  { name: "Processing", count: 342, percentage: 18, color: "bg-amber-500" },
  { name: "Pending", count: 256, percentage: 13, color: "bg-blue-500" },
  { name: "Failed", count: 76, percentage: 4, color: "bg-red-500" },
]

export default function PaymentPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPayments = payments.filter(
    (payment) =>
      payment.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-amber-100 text-amber-800"
      case "Pending":
        return "bg-blue-100 text-blue-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Suspense fallback={<Loading />}>
      <>
        <PageHeader
          title="Payment Management"
          description="Track and manage all payment transactions."
        >
          <Button className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="w-4 h-4" />
            Add Payment
          </Button>
        </PageHeader>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">₦2,401,420</p>
              <p className="text-xs text-[var(--color-positive)] mt-1">+15.2% vs last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completed</span>
                <div className="p-2 bg-muted rounded-lg">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">1,245</p>
              <p className="text-xs text-[var(--color-positive)] mt-1">+8.4% vs last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Processing</span>
                <div className="p-2 bg-muted rounded-lg">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">342</p>
              <p className="text-xs text-[var(--color-negative)] mt-1">-2.1% vs last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Transaction</span>
                <div className="p-2 bg-muted rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">₦89,500</p>
              <p className="text-xs text-[var(--color-positive)] mt-1">+3.2% vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Segments & List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Segments */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSegments.map((segment) => (
                  <div key={segment.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{segment.name}</span>
                      <span className="text-sm font-medium">{segment.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${segment.color}`}
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{segment.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment List */}
          <Card className="lg:col-span-3 bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Payments</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Course</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{payment.student.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{payment.student}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{payment.course}</td>
                        <td className="py-3 px-2 text-sm text-right font-medium">{payment.amount}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-muted-foreground">{payment.date}</td>
                        <td className="py-3 px-2 text-sm text-left text-muted-foreground">{payment.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    </Suspense>
  )
}