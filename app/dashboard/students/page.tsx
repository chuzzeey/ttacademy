"use client"

import { useState } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Calendar, Download, DollarSign, ShoppingBag, CreditCard, Search, Eye, ChevronLeft, ChevronRight, User, X, Mail, BookOpen, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const studentRecords = [
  { name: "Sarah Parker", email: "sarah.parker@northstar.io", course: "Front End Engineering", payment: "Not Paid", joined: "30th April 2026", joinedTime: "10:25 AM" },
  { name: "Michael Brown", email: "michael.brown@cedarpoint.co", course: "Backend Engineering", payment: "Not Paid", joined: "29th April 2026", joinedTime: "10:08 AM" },
  { name: "Linda Chen", email: "linda.chen@brightpath.app", course: "Full Stack Engineering", payment: "Not Paid", joined: "28th April 2026", joinedTime: "9:51 AM" },
  { name: "David Lee", email: "david.lee@bluepeak.app", course: "Front End Engineering", payment: "Not Paid", joined: "27th April 2026", joinedTime: "9:34 AM" },
  { name: "Emily White", email: "emily.white@ridgefield.io", course: "Backend Engineering", payment: "Not Paid", joined: "26th April 2026", joinedTime: "9:17 AM" },
  { name: "Jessica Wong", email: "jessica.wong@pulselabs.ai", course: "Full Stack Engineering", payment: "Not Paid", joined: "25th April 2026", joinedTime: "9:00 AM" },
  { name: "Kevin Harris", email: "kevin.harris@oakline.co", course: "Front End Engineering", payment: "Not Paid", joined: "24th April 2026", joinedTime: "12:07 PM" },
  { name: "Priya Shah", email: "priya.shah@holloway.io", course: "Backend Engineering", payment: "Not Paid", joined: "23rd April 2026", joinedTime: "11:50 AM" },
  { name: "Daniel Hall", email: "daniel.hall@quantix.dev", course: "Full Stack Engineering", payment: "Not Paid", joined: "22nd April 2026", joinedTime: "11:33 AM" },
  { name: "Ava Mitchell", email: "ava.mitchell@clearledger.co", course: "Front End Engineering", payment: "Not Paid", joined: "21st April 2026", joinedTime: "11:16 AM" },
]

export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<typeof studentRecords[0] | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalStudents = studentRecords.length
  const totalPages = Math.ceil(totalStudents / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalStudents)
  const currentStudents = studentRecords.slice(startIndex, endIndex)

  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const openPanel = (student: typeof studentRecords[0]) => {
    setSelectedStudent(student)
    requestAnimationFrame(() => {
      setPanelOpen(true)
    })
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => {
      setSelectedStudent(null)
    }, 300)
  }

  const getPaymentIcon = (payment: string) => {
    if (payment === "Not Paid") return <XCircle className="w-5 h-5 text-red-500" />
    if (payment === "Fully Paid") return <CheckCircle className="w-5 h-5 text-green-500" />
    return <Clock className="w-5 h-5 text-amber-500" />
  }

  const getPaymentColor = (payment: string) => {
    if (payment === "Not Paid") return "text-red-500"
    if (payment === "Fully Paid") return "text-green-500"
    return "text-amber-500"
  }

  return (
    <>
      <PageHeader
        title="Student Records"
        description="View and manage student database with payment and registration activity."
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Students Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Students</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">0</p>
            <p className="text-[10px] sm:text-xs text-[var(--color-positive)] mt-1">+12.5%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Total registrations</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Enrolled Students</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">0</p>
            <p className="text-[10px] sm:text-xs text-[var(--color-negative)] mt-1">-20%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Acquisition needs attention</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Revenue</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">₦0</p>
            <p className="text-[10px] sm:text-xs text-[var(--color-positive)] mt-1">+12.5%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Total revenue collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Records */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Student Records</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">View and manage student database with payment and registration activity.</p>
          
          {/* Filters - Stack vertically on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-3 gap-3">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-9 w-full" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Course(s)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="frontend">Front End Engineering</SelectItem>
                  <SelectItem value="backend">Backend Engineering</SelectItem>
                  <SelectItem value="fullstack">Full Stack Engineering</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="notpaid">Not Paid</SelectItem>
                  <SelectItem value="fullypaid">Fully Paid</SelectItem>
                  <SelectItem value="1stinstallment">1st Installment</SelectItem>
                  <SelectItem value="2ndinstallment">2nd Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table - hidden on tablet and mobile */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Course(s)</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Update Payment Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student.name} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{student.email}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{student.course}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--color-negative)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm text-[var(--color-negative)]">{student.payment}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Select>
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          <SelectValue placeholder={student.payment} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notpaid">Not Paid</SelectItem>
                          <SelectItem value="fullypaid">Fully Paid</SelectItem>
                          <SelectItem value="1stinstallment">1st Installment</SelectItem>
                          <SelectItem value="2ndinstallment">2nd Installment</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">
                      {student.joined}<br />at {student.joinedTime}
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs h-8"
                        onClick={() => openPanel(student)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards - shown on tablet and mobile */}
          <div className="lg:hidden space-y-3">
            {currentStudents.map((student) => (
              <div key={student.name} className="border border-border rounded-lg p-3 sm:p-4 space-y-3">
                {/* Student Name & Email */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs h-7 px-2"
                    onClick={() => openPanel(student)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">View</span>
                  </Button>
                </div>

                {/* Course */}
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Course:</span>
                  <span className="font-medium">{student.course}</span>
                </div>

                {/* Payment & Joined row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[var(--color-negative)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-[var(--color-negative)] font-medium">{student.payment}</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {student.joined}
                  </div>
                </div>

                {/* Update Payment Status for mobile */}
                <div className="pt-1">
                  <Select>
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue placeholder={student.payment} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notpaid">Not Paid</SelectItem>
                      <SelectItem value="fullypaid">Fully Paid</SelectItem>
                      <SelectItem value="1stinstallment">1st Installment</SelectItem>
                      <SelectItem value="2ndinstallment">2nd Installment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-border gap-3">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing {startIndex + 1}-{endIndex} of {totalStudents} students
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-xs sm:text-sm text-muted-foreground px-1">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs sm:text-sm ${
                      currentPage === page ? "bg-muted font-medium" : ""
                    }`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide-in Panel Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePanel}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm sm:max-w-md bg-background border-l border-border/60 shadow-2xl transform transition-all duration-300 ease-in-out ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedStudent && (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border/40">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold truncate">{selectedStudent.name}</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Student Details</p>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
              {/* Student Info Card */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Full Name</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{selectedStudent.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Email Address</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Info Card */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Enrolled Course</p>
                      <p className="text-xs sm:text-sm font-medium">{selectedStudent.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Date Joined</p>
                      <p className="text-xs sm:text-sm font-medium">{selectedStudent.joined} at {selectedStudent.joinedTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status (Read-only) */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Status</h3>
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                    {getPaymentIcon(selectedStudent.payment)}
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Current Status</p>
                    <p className={`text-xs sm:text-sm font-medium ${getPaymentColor(selectedStudent.payment)}`}>
                      {selectedStudent.payment}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/40">
              <Button
                className="w-full bg-foreground text-background hover:bg-foreground/90 text-xs sm:text-sm"
                onClick={closePanel}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}