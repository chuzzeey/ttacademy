"use client"

import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Search, Eye, ChevronLeft, ChevronRight, User, X, Mail, BookOpen, Clock, Phone, MapPin, Copy, Check, Shield, ShieldOff, SlidersHorizontal, ChevronDown } from "lucide-react"
import { formatLocation } from "@/lib/state-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

const COURSES = [
  "Cybersecurity", "Data Science", "AI Automation", "Computer Networking",
  "Ethical Hacking", "Graphic Design", "UI/UX Design", "Full Stack Development",
  "Frontend Development", "Backend Development", "Web Development",
  "Digital Marketing", "Cloud Computing", "Data Analysis",
]

const PAYMENT_STATUSES = [
  { value: "all", label: "All Payments" },
  { value: "Not Paid Yet", label: "Not Paid Yet" },
  { value: "Fully Paid", label: "Paid" },
  { value: "1st Installment", label: "First Installment" },
  { value: "2nd Installment", label: "Second Installment" },
]

interface Student {
  id: string
  name: string
  date_of_birth: string | null
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
  restricted: boolean
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [restrictConfirmStudent, setRestrictConfirmStudent] = useState<Student | null>(null)
  const [restrictingId, setRestrictingId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [updatingPaymentMap, setUpdatingPaymentMap] = useState<Record<string, boolean>>({})
  const itemsPerPage = 10

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const res = await fetch("/api/registrations")
        const json: { data?: Student[]; error?: string } = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to load students")
        if (!Array.isArray(json.data)) {
          throw new Error("The registrations response did not contain a student list")
        }
        setStudents(json.data)
      } catch (err) {
        console.error("Failed to fetch students:", err)
        setLoadError(err instanceof Error ? err.message : "Unable to load students.")
      } finally {
        setLoading(false)
      }
    }
    void fetchStudents()
  }, [reloadKey])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("admin-student-records")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        setReloadKey((key) => key + 1)
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Student live updates unavailable:", error ?? status)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, courseFilter, paymentFilter])

  const availableCourses = useMemo(() => {
    const fromData = [...new Set(students.map(s => s.course))].filter(Boolean)
    if (fromData.length > 0) return fromData
    return COURSES
  }, [students])

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
        (paymentFilter === "Not Paid Yet"
          ? student.payment_status === "Not Paid Yet" || student.payment_status === "Not Paid"
          : student.payment_status === paymentFilter)

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

  const getPaymentColor = (payment: string) => {
    if (payment === "Not Paid" || payment === "Not Paid Yet") return "text-red-600"
    if (payment === "Fully Paid") return "text-green-500"
    if (payment === "1st Installment") return "text-amber-500"
    if (payment === "2nd Installment") return "text-blue-500"
    return "text-muted-foreground"
  }

  const getPaymentBg = (payment: string) => {
    if (payment === "Not Paid" || payment === "Not Paid Yet") return "bg-red-50"
    if (payment === "Fully Paid") return "bg-green-50"
    if (payment === "1st Installment") return "bg-amber-50"
    if (payment === "2nd Installment") return "bg-blue-50"
    return "bg-muted"
  }

  const updatePaymentStatus = async (studentId: string, payment_status: string) => {
    setUpdatingPaymentMap(prev => ({ ...prev, [studentId]: true }))
    try {
      const res = await fetch("/api/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, payment_status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, payment_status } : s))
      if (selectedStudent?.id === studentId) {
        setSelectedStudent({ ...selectedStudent, payment_status })
      }
    } catch (err) {
      console.error("Failed to update payment status:", err)
      alert("Failed to update payment status. Please try again.")
    } finally {
      setUpdatingPaymentMap(prev => ({ ...prev, [studentId]: false }))
    }
  }

  const handleRestrictStudent = async (student: Student, restrict: boolean) => {
    setRestrictingId(student.id)
    try {
      const res = await fetch("/api/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, restricted: restrict }),
      })
      if (!res.ok) throw new Error("Failed to update restriction")
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, restricted: restrict } : s))
      if (selectedStudent?.id === student.id) {
        setSelectedStudent({ ...selectedStudent, restricted: restrict })
      }
      setRestrictConfirmStudent(null)
    } catch (err) {
      console.error("Failed to update restriction:", err)
      alert("Failed to update restriction. Please try again.")
    } finally {
      setRestrictingId(null)
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

  const getPaymentLabel = (payment: string) => {
    if (payment === "Not Paid") return "Not Paid Yet"
    if (payment === "Fully Paid") return "Paid"
    if (payment === "1st Installment") return "First Installment"
    if (payment === "2nd Installment") return "Second Installment"
    return payment
  }

  const paymentOptions = ["Not Paid Yet", "Fully Paid", "1st Installment", "2nd Installment"]

  return (
    <>
      <PageHeader
        title="Student Records"
        description="Search, review, and manage registrations."
      />

      <div className="mb-6 grid grid-cols-3 border-y border-border bg-card">
        <div className="px-3 py-3 sm:px-5">
          <p className="text-lg font-semibold tabular-nums">
            {loading ? "—" : totalStudents}
          </p>
          <p className="text-xs text-muted-foreground">Students</p>
        </div>
        <div className="border-l border-border px-3 py-3 sm:px-5">
          <p className="text-lg font-semibold tabular-nums">
            {loading
              ? "—"
              : students.filter((student) => student.payment_status && student.payment_status !== "Not Paid" && student.payment_status !== "Not Paid Yet").length}
          </p>
          <p className="text-xs text-muted-foreground">Payment recorded</p>
        </div>
        <div className="border-l border-border px-3 py-3 sm:px-5">
          <p className="text-lg font-semibold tabular-nums">
            {loading
              ? "—"
              : students.filter((student) => student.payment_status === "Not Paid" || student.payment_status === "Not Paid Yet").length}
          </p>
          <p className="text-xs text-muted-foreground">Awaiting payment</p>
        </div>
      </div>

      {/* Student Records */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3 sm:pb-4">
          {/* Search + Filter Toggle */}
          <div className="mt-4 flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                aria-label="Search students"
                className="pl-9 pr-9 w-full h-10 sm:h-11 text-sm rounded-xl bg-muted/30 border-border/60 focus:bg-background focus:border-amber-400/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              aria-label="Show filters"
              aria-expanded={showFilters}
              className="h-10 sm:h-11 w-10 sm:w-11 p-0 flex-shrink-0 rounded-xl border-border/60"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="h-10 text-xs rounded-xl">
                  <SelectValue placeholder="Course" />
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
                <SelectTrigger className="h-10 text-xs rounded-xl">
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
          )}

          {/* Active filters indicator */}
          {(searchQuery || courseFilter !== "all" || paymentFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {courseFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                  {formatCourseName(courseFilter)}
                  <button onClick={() => setCourseFilter("all")}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {paymentFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                  {PAYMENT_STATUSES.find(p => p.value === paymentFilter)?.label}
                  <button onClick={() => setPaymentFilter("all")}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              <button
                onClick={() => { setSearchQuery(""); setCourseFilter("all"); setPaymentFilter("all") }}
                className="text-[10px] text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loadError && (
            <div
              role="alert"
              className="mb-4 flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>Could not load students: {loadError}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 bg-white text-red-800 hover:bg-red-100"
                onClick={() => setReloadKey((key) => key + 1)}
                disabled={loading}
              >
                Try again
              </Button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : loadError && students.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Student records are unavailable until the request succeeds.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery || courseFilter !== "all" || paymentFilter !== "all"
                  ? "No students match your filters."
                  : "No students found."}
              </p>
              {(searchQuery || courseFilter !== "all" || paymentFilter !== "all") && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearchQuery(""); setCourseFilter("all"); setPaymentFilter("all") }}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Student Cards - Works on ALL screen sizes */}
              <div className="space-y-2.5 sm:space-y-3">
                {currentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border border-border/60 rounded-xl p-3.5 sm:p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => openPanel(student)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{student.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{student.email}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Payment status</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Payment status: ${getPaymentLabel(student.payment_status)}. Change status`}
                                    className={`inline-flex min-h-7 items-center gap-1.5 border border-current/15 px-2.5 py-1 text-[11px] font-semibold ${getPaymentBg(student.payment_status)} ${getPaymentColor(student.payment_status)} transition-opacity hover:opacity-80`}
                                    disabled={updatingPaymentMap[student.id]}
                                  >
                                    {updatingPaymentMap[student.id] ? (
                                      <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Updating...
                                      </span>
                                    ) : (
                                      <>
                                        {getPaymentLabel(student.payment_status)}
                                        <ChevronDown className="w-2.5 h-2.5" />
                                      </>
                                    )}
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="min-w-[140px] p-1 rounded-xl border-border/60"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {paymentOptions.map((option) => (
                                    <DropdownMenuItem
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updatePaymentStatus(student.id, option)
                                      }}
                                      className={`rounded-lg text-xs py-2 cursor-pointer ${
                                        getPaymentLabel(student.payment_status) === getPaymentLabel(option)
                                          ? "bg-amber-500/10 text-amber-600 font-medium"
                                          : ""
                                      }`}
                                    >
                                      {(option === "Not Paid" || option === "Not Paid Yet") && <span className="text-red-500 mr-2">●</span>}
                                      {option === "Fully Paid" && <span className="text-green-500 mr-2">●</span>}
                                      {option === "1st Installment" && <span className="text-amber-500 mr-2">●</span>}
                                      {option === "2nd Installment" && <span className="text-blue-500 mr-2">●</span>}
                                      {getPaymentLabel(option)}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {student.restricted && (
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-600 text-[9px] font-semibold rounded-full">
                                  RESTRICTED
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full shrink-0 hover:bg-muted/80"
                            onClick={(e) => { e.stopPropagation(); openPanel(student) }}
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {formatCourseName(student.course)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {student.reg_date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col xs:flex-row items-center justify-between mt-5 pt-4 border-t border-border/60 gap-3">
                <p className="text-xs text-muted-foreground text-center xs:text-left">
                  {startIndex + 1}-{endIndex} of {filteredStudents.length}
                  {filteredStudents.length !== students.length && (
                    <span className="text-muted-foreground/60"> (filtered)</span>
                  )}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="text-xs text-muted-foreground px-1">...</span>
                      ) : (
                        <Button key={page} variant="outline" size="sm"
                          className={`h-9 w-9 p-0 text-xs rounded-xl ${currentPage === page ? "bg-amber-500/10 text-amber-600 font-medium border-amber-500/20" : ""}`}
                          onClick={() => goToPage(page)}>
                          {page}
                        </Button>
                      )
                    )}
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
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
      <div className={`fixed inset-0 z-[60] bg-black/40 modal-overlay transition-all duration-300 ease-in-out ${panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={closePanel} />
      <div className={`fixed top-0 right-0 z-[70] h-full w-full max-w-sm bg-background border-l border-border/60 shadow-2xl transform transition-all duration-300 ease-in-out ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
        {selectedStudent && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold truncate">{selectedStudent.name}</h2>
                  <p className="text-[10px] text-muted-foreground">Student Details</p>
                </div>
              </div>
              <button onClick={closePanel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><User className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Full Name</p>
                      <p className="text-xs font-medium truncate">{selectedStudent.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><Clock className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Date of birth</p>
                      <p className="text-xs font-medium">
                        {selectedStudent.date_of_birth
                          ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${selectedStudent.date_of_birth}T00:00:00.000Z`))
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><Mail className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Email</p>
                      <p className="text-xs font-medium truncate">{selectedStudent.email}</p>
                    </div>
                    <button onClick={() => copyToClipboard(selectedStudent.email, "email")} className="p-1.5 hover:bg-muted rounded-md shrink-0">
                      {copiedId === "email" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><Phone className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Phone</p>
                      <p className="text-xs font-medium truncate">{selectedStudent.phone}</p>
                    </div>
                    <button onClick={() => copyToClipboard(selectedStudent.phone, "phone")} className="p-1.5 hover:bg-muted rounded-md shrink-0">
                      {copiedId === "phone" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Location</p>
                      <p className="text-xs font-medium truncate">{formatLocation(selectedStudent.country, selectedStudent.state)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Course Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><BookOpen className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Course</p>
                      <p className="text-xs font-medium">{formatCourseName(selectedStudent.course)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0"><Clock className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Joined</p>
                      <p className="text-xs font-medium">{selectedStudent.reg_date} at {selectedStudent.reg_time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Account Status */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">Payment</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${getPaymentColor(selectedStudent.payment_status)} hover:opacity-80 transition-opacity`}>
                            {getPaymentLabel(selectedStudent.payment_status)}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[140px] p-1 rounded-xl border-border/60">
                          {paymentOptions.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() => updatePaymentStatus(selectedStudent.id, option)}
                              className={`rounded-lg text-xs py-2 cursor-pointer ${
                                getPaymentLabel(selectedStudent.payment_status) === getPaymentLabel(option)
                                  ? "bg-amber-500/10 text-amber-600 font-medium"
                                  : ""
                              }`}
                            >
                              {(option === "Not Paid" || option === "Not Paid Yet") && <span className="text-red-500 mr-2">●</span>}
                              {option === "Fully Paid" && <span className="text-green-500 mr-2">●</span>}
                              {option === "1st Installment" && <span className="text-amber-500 mr-2">●</span>}
                              {option === "2nd Installment" && <span className="text-blue-500 mr-2">●</span>}
                              {getPaymentLabel(option)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">Account</p>
                      <p className="text-xs font-medium mt-0.5">{selectedStudent.restricted ? "Restricted" : "Active"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedStudent.reason && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Motivation</h3>
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs">{selectedStudent.reason}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-border/40 space-y-2">
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90 text-xs rounded-xl h-10" onClick={closePanel}>
                Close
              </Button>
              <Button
                variant="outline"
                className={`w-full text-xs rounded-xl h-10 ${
                  selectedStudent.restricted
                    ? "text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                    : "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                }`}
                onClick={() => setRestrictConfirmStudent(selectedStudent)}
                disabled={restrictingId === selectedStudent?.id}
              >
                {restrictingId === selectedStudent?.id ? (
                  <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />Updating...</>
                ) : selectedStudent.restricted ? (
                  <><Shield className="w-3.5 h-3.5 mr-1.5" />Unrestrict Student</>
                ) : (
                  <><ShieldOff className="w-3.5 h-3.5 mr-1.5" />Restrict Student</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Restrict Confirmation Dialog */}
      {restrictConfirmStudent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 modal-overlay" onClick={() => !restrictingId && setRestrictConfirmStudent(null)} />
          <div className="relative bg-background rounded-xl border border-border shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${restrictConfirmStudent.restricted ? "bg-green-100" : "bg-red-100"}`}>
                {restrictConfirmStudent.restricted ? <Shield className="w-4 h-4 text-green-500" /> : <ShieldOff className="w-4 h-4 text-red-500" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{restrictConfirmStudent.restricted ? "Unrestrict Student" : "Restrict Student"}</h3>
                <p className="text-[11px] text-muted-foreground">This will affect their account access</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to {restrictConfirmStudent.restricted ? "unrestrict" : "restrict"} <strong className="text-foreground">{restrictConfirmStudent.name}</strong>? 
              {!restrictConfirmStudent.restricted && " This will deny them access to their classroom."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRestrictConfirmStudent(null)} disabled={!!restrictingId}>Cancel</Button>
              <Button
                size="sm"
                onClick={() => handleRestrictStudent(restrictConfirmStudent, !restrictConfirmStudent.restricted)}
                disabled={!!restrictingId}
                className={restrictConfirmStudent.restricted ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
              >
                {restrictingId === restrictConfirmStudent.id ? (
                  <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />Updating...</>
                ) : (
                  `Yes, ${restrictConfirmStudent.restricted ? "Unrestrict" : "Restrict"}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}