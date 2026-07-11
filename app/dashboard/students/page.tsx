"use client"

import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Calendar, Download, DollarSign, ShoppingBag, CreditCard, Search, Eye, ChevronLeft, ChevronRight, User, X, Mail, BookOpen, Clock, CheckCircle, XCircle, ChevronDown, Briefcase, Monitor, Phone, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const COURSES = [
  "Cybersecurity", "Data Science", "AI Automation", "Computer Networking",
  "Ethical Hacking", "Graphic Design", "UI/UX Design", "Full Stack Development",
  "Frontend Development", "Backend Development", "Web Development",
  "Digital Marketing", "Cloud Computing", "Data Analysis",
]

const PAYMENT_STATUSES = [
  { value: "all", label: "All Payments" },
  { value: "Not Paid", label: "Not Paid" },
  { value: "Fully Paid", label: "Fully Paid" },
  { value: "1st Installment", label: "1st Installment" },
  { value: "2nd Installment", label: "2nd Installment" },
]

interface Student {
  id: string
  name: string
  email: string
  phone: string
  course: string
  sex: string
  country: string
  state: string | null
  employment_status: string
  has_laptop: string
  reason: string
  payment_status: string
  reg_date: string
  reg_time: string
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const itemsPerPage = 10

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/registrations")
        const json = await res.json()
        if (json.data) setStudents(json.data)
      } catch (err) {
        console.error("Failed to fetch students:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, courseFilter, paymentFilter])

  // Derive unique courses from actual student data, fallback to COURSES list
  const availableCourses = useMemo(() => {
    const fromData = [...new Set(students.map(s => s.course))].filter(Boolean)
    if (fromData.length > 0) return fromData
    return COURSES
  }, [students])

  // Filter students based on search + course + payment
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchQuery.toLowerCase().trim()
      const matchesSearch = !searchLower ||
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.course.toLowerCase().includes(searchLower) ||
        student.phone.includes(searchLower)

      const matchesCourse = courseFilter === "all" ||
        student.course.toLowerCase() === courseFilter.toLowerCase()

      const matchesPayment = paymentFilter === "all" ||
        student.payment_status === paymentFilter

      return matchesSearch && matchesCourse && matchesPayment
    })
  }, [students, searchQuery, courseFilter, paymentFilter])

  const totalStudents = students.length
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredStudents.length)
  const currentStudents = filteredStudents.slice(startIndex, endIndex)

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
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const openPanel = (student: Student) => {
    setSelectedStudent(student)
    requestAnimationFrame(() => setPanelOpen(true))
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedStudent(null), 300)
  }

  // For the Payment column - color only, no background
  const getPaymentColor = (payment: string) => {
    if (payment === "Not Paid") return "text-red-500"
    if (payment === "Fully Paid") return "text-green-500"
    if (payment === "1st Installment") return "text-yellow-500"
    return "text-blue-500"
  }

  // For the Update Payment Status button - background + white text
  const getPaymentButtonClass = (payment: string) => {
    if (payment === "Not Paid") return "bg-red-500 text-white"
    if (payment === "Fully Paid") return "bg-green-500 text-white"
    if (payment === "1st Installment") return "bg-yellow-500 text-white"
    return "bg-blue-500 text-white"
  }

  const getPaymentIcon = (payment: string) => {
    if (payment === "Not Paid") return <XCircle className="w-5 h-5 text-white" />
    if (payment === "Fully Paid") return <CheckCircle className="w-5 h-5 text-white" />
    if (payment === "1st Installment") return <Clock className="w-5 h-5 text-white" />
    return <Clock className="w-5 h-5 text-white" />
  }

  const updatePaymentStatus = async (studentId: string, payment_status: string) => {
    try {
      const res = await fetch("/api/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, payment_status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, payment_status } : s))
    } catch (err) {
      console.error("Failed to update payment status:", err)
      alert("Failed to update payment status. Please try again.")
    }
  }

  const getEmploymentLabel = (val: string) => {
    const map: Record<string, string> = { employed: "Employed", unemployed: "Unemployed", student: "Student", freelancer: "Freelancer" }
    return map[val] || val
  }

  const getLaptopLabel = (val: string) => {
    return val === "yes" ? "Yes" : "No"
  }

  const formatCourseName = (course: string) => {
    return course
      .split(/(?<=[a-z])(?=[A-Z])|_|-| /)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <>
      <PageHeader
        title="Student Records"
        description="View and manage student database with payment and registration activity."
      >
        <Button variant="outline" className="flex items-center gap-2 bg-transparent w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </PageHeader>

      {/* Students Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Students</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">{totalStudents}</p>
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
            <p className="text-2xl sm:text-3xl font-semibold">{students.filter(s => s.payment_status !== "Not Paid").length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Students with payments</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Not Paid</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">{students.filter(s => s.payment_status === "Not Paid").length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Records */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Student Records</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">View and manage student database with payment and registration activity.</p>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-3 gap-3">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, course or phone..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Course(s)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {availableCourses.map((course) => (
                    <SelectItem key={course} value={course.toLowerCase()}>
                      {formatCourseName(course)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchQuery || courseFilter !== "all" || paymentFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[11px] text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {courseFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                  Course: {formatCourseName(courseFilter)}
                  <button onClick={() => setCourseFilter("all")}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {paymentFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                  Payment: {PAYMENT_STATUSES.find(p => p.value === paymentFilter)?.label}
                  <button onClick={() => setPaymentFilter("all")}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              <button
                onClick={() => { setSearchQuery(""); setCourseFilter("all"); setPaymentFilter("all") }}
                className="text-[10px] text-muted-foreground hover:text-foreground underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery || courseFilter !== "all" || paymentFilter !== "all"
                  ? "No students match your filters. Try adjusting your search criteria."
                  : "No students found. Fill out the contact form to add students."}
              </p>
              {(searchQuery || courseFilter !== "all" || paymentFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => { setSearchQuery(""); setCourseFilter("all"); setPaymentFilter("all") }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
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
                      <tr key={student.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{student.email}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{formatCourseName(student.course)}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${getPaymentColor(student.payment_status)}`}>{student.payment_status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Select value={student.payment_status.toLowerCase().replace(/ /g, "")} onValueChange={(value) => {
                            const statusMap: Record<string, string> = {
                              "notpaid": "Not Paid",
                              "fullypaid": "Fully Paid",
                              "1stinstallment": "1st Installment",
                              "2ndinstallment": "2nd Installment"
                            }
                            updatePaymentStatus(student.id, statusMap[value])
                          }}>
                            <SelectTrigger className={`h-8 w-[140px] text-xs font-medium border-0 rounded-md ${getPaymentButtonClass(student.payment_status)}`}>
                              <span className="flex items-center gap-1.5">
                                {getPaymentIcon(student.payment_status)}
                                <span>{student.payment_status}</span>
                              </span>
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
                          {student.reg_date}<br />at {student.reg_time}
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

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden space-y-3">
                {currentStudents.map((student) => (
                  <div key={student.id} className="border border-border rounded-lg p-3 sm:p-4 space-y-3">
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
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs h-7 px-2" onClick={() => openPanel(student)}>
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">View</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Course:</span>
                      <span className="font-medium">{formatCourseName(student.course)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${getPaymentColor(student.payment_status)}`}>{student.payment_status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">{student.reg_date}</div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Status</span>
                      <Select value={student.payment_status.toLowerCase().replace(/ /g, "")} onValueChange={(value) => {
                        const statusMap: Record<string, string> = {
                          "notpaid": "Not Paid",
                          "fullypaid": "Fully Paid",
                          "1stinstallment": "1st Installment",
                          "2ndinstallment": "2nd Installment"
                        }
                        updatePaymentStatus(student.id, statusMap[value])
                      }}>
                        <SelectTrigger className={`h-8 w-auto min-w-[130px] text-xs font-medium border-0 rounded-md ${getPaymentButtonClass(student.payment_status)}`}>
                          <span className="flex items-center gap-1.5">
                            {getPaymentIcon(student.payment_status)}
                            <span>{student.payment_status}</span>
                          </span>
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

              {/* Results count & Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-border gap-3">
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {startIndex + 1}-{endIndex} of {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                  {filteredStudents.length !== students.length && (
                    <span className="text-muted-foreground/60"> (filtered from {students.length} total)</span>
                  )}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="text-xs sm:text-sm text-muted-foreground px-1">...</span>
                      ) : (
                        <Button key={page} variant="outline" size="sm"
                          className={`h-8 w-8 p-0 text-xs sm:text-sm ${currentPage === page ? "bg-muted font-medium" : ""}`}
                          onClick={() => goToPage(page)}>
                          {page}
                        </Button>
                      )
                    )}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Slide-in Panel */}
      <div className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out ${panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={closePanel} />
      <div className={`fixed top-0 right-0 z-[70] h-full w-full max-w-sm sm:max-w-md bg-background border-l border-border/60 shadow-2xl transform transition-all duration-300 ease-in-out ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
        {selectedStudent && (
          <div className="h-full flex flex-col">
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
              <button onClick={closePanel} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0">
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
              {/* Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Full Name</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{selectedStudent.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Email Address</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Phone/WhatsApp</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{selectedStudent.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Location</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{selectedStudent.country}{selectedStudent.state ? `, ${selectedStudent.state}` : ""}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Enrolled Course</p>
                      <p className="text-xs sm:text-sm font-medium">{formatCourseName(selectedStudent.course)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Employment Status</p>
                      <p className="text-xs sm:text-sm font-medium">{getEmploymentLabel(selectedStudent.employment_status)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Has Laptop</p>
                      <p className="text-xs sm:text-sm font-medium">{getLaptopLabel(selectedStudent.has_laptop)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Date Joined</p>
                      <p className="text-xs sm:text-sm font-medium">{selectedStudent.reg_date} at {selectedStudent.reg_time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivation</h3>
                <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Why they want to learn this skill</p>
                  <p className="text-xs sm:text-sm">{selectedStudent.reason}</p>
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Status</h3>
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Current Status</p>
                    <p className={`text-xs sm:text-sm font-medium ${getPaymentColor(selectedStudent.payment_status)}`}>
                      {selectedStudent.payment_status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/40">
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90 text-xs sm:text-sm" onClick={closePanel}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}