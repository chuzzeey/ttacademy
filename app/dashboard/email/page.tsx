"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Search, Mail, User, Eye, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Loading from "./loading"

interface Student {
  id: string
  name: string
  email: string
  course: string
  sex: string
}

interface SentEmail {
  id: string
  to: string
  subject: string
  body: string
  date: string
  status: "Sent" | "Failed"
}

export default function EmailPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sending, setSending] = useState(false)
  const [emailModal, setEmailModal] = useState(false)
  const [emailContent, setEmailContent] = useState({ to: "", subject: "", body: "" })
  const [emailType, setEmailType] = useState("")
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [viewEmailModal, setViewEmailModal] = useState(false)
  const [viewAllModal, setViewAllModal] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null)
  const itemsPerPage = 10

  const emailTemplates: Record<string, { subject: string; body: string }> = {
    "Welcome Email": {
      subject: "Welcome to Tech Trailblazer Academy!",
      body: "Dear Student,\n\nWelcome to Tech Trailblazer Academy! We're excited to have you on board.\n\nWe are committed to helping you succeed in your learning journey. Our team is here to support you every step of the way.\n\nIf you have any questions, feel free to reach out to us.\n\nBest regards,\nTech Trailblazer Academy Team"
    },
    "Payment confirmation Email": {
      subject: "Payment Confirmation - Tech Trailblazer Academy",
      body: "Dear Student,\n\nThank you for your payment! We're pleased to confirm that your payment has been received successfully.\n\nYour enrollment is now active and you can start accessing your course materials immediately.\n\nIf you have any questions regarding your payment or enrollment, please don't hesitate to contact us.\n\nBest regards,\nTech Trailblazer Academy Team"
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/registrations")
        const json = await res.json()
        if (json.data) {
          setStudents(json.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            course: s.course,
            sex: s.sex || "N/A"
          })))
        }
      } catch (err) {
        console.error("Failed to fetch students:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredStudents = students.filter(student =>
    !searchQuery ||
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleSendEmail = (student: Student) => {
    setEmailContent({
      to: student.email,
      subject: "",
      body: ""
    })
    setEmailType("")
    setShowEmailForm(false)
    setEmailModal(true)
  }

  const handleSelectEmailType = (type: string) => {
    setEmailType(type)
    const template = emailTemplates[type]
    if (template) {
      setEmailContent(prev => ({
        ...prev,
        subject: template.subject,
        body: template.body
      }))
    }
    setShowEmailForm(true)
  }

  const handleSend = async () => {
    setSending(true)
    setTimeout(() => {
      const newEmail: SentEmail = {
        id: Date.now().toString(),
        to: emailContent.to,
        subject: emailContent.subject,
        body: emailContent.body,
        date: new Date().toLocaleString("en-US", { 
          month: "short", 
          day: "numeric", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        status: "Sent"
      }
      
      setSentEmails(prev => [newEmail, ...prev])
      alert(`Email sent successfully!`)
      setSending(false)
      setEmailModal(false)
      setEmailContent({ to: "", subject: "", body: "" })
    }, 1000)
  }

  return (
    <>
      <PageHeader
        title="Email Follow-up"
        description="Manage and send email follow-ups to students."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Students</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">{students.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Available for email</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">New Students</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">
              {Math.min(5, students.length)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Recently joined</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Courses</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">
              {[...new Set(students.map(s => s.course))].length}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active courses</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Emails Sent</span>
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold">{sentEmails.length}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total sent this session</p>
              <Button
                size="sm"
                onClick={() => setViewAllModal(true)}
                className="h-6 text-xs bg-foreground text-background hover:bg-foreground/90 px-2"
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sent Emails Section */}
      {sentEmails.length > 0 && (
        <Card className="dashboard-card mb-4 sm:mb-6">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-medium">Sent Emails</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Recently sent emails this session
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">To</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sentEmails.map((email) => (
                    <tr key={email.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 text-sm font-medium">{email.to}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground max-w-[300px] truncate">{email.subject}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          {email.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground whitespace-nowrap">{email.date}</td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEmail(email)
                            setViewEmailModal(true)
                          }}
                          className="flex items-center gap-1 text-xs h-8"
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
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Student Directory</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View students and send them email follow-ups
          </p>

          {/* Search */}
          <div className="relative w-full sm:w-[300px] mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or course..."
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
                {searchQuery ? "No students match your search." : "No students found."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Course</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Action</th>
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
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {student.course}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(student)}
                            className="flex items-center gap-1 text-xs h-8 border-border/60"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Send Email
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
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className="text-[10px]">
                        {student.course}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmail(student)}
                      className="w-full flex items-center gap-1.5 text-xs h-8 border-border/60"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Send Email
                    </Button>
                  </div>
                ))}
              </div>

              {/* Results count & Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-border gap-3">
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {startIndex + 1}-{endIndex} of {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
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

      {/* View All Sent Emails Modal */}
      {viewAllModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewAllModal(false)}>
          <div className="bg-background border border-border/60 shadow-2xl rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40">
              <h2 className="text-base sm:text-lg font-semibold">Sent Emails Overview</h2>
              <button onClick={() => setViewAllModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {sentEmails.length === 0 ? (
                <div className="py-12 text-center">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No emails sent yet in this session.</p>
                  <p className="text-xs text-muted-foreground mt-1">Send an email to see it here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">To</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentEmails.map((email) => (
                        <tr key={email.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-2 text-sm font-medium">{email.to}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground max-w-[300px] truncate">{email.subject}</td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              {email.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-muted-foreground whitespace-nowrap">{email.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end p-4 sm:p-6 border-t border-border/40">
              <Button variant="outline" onClick={() => setViewAllModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Email Modal */}
      {viewEmailModal && selectedEmail && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewEmailModal(false)}>
          <div className="bg-background border border-border/60 shadow-2xl rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40">
              <h2 className="text-base sm:text-lg font-semibold">Email Details</h2>
              <button onClick={() => setViewEmailModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">To</Label>
                <p className="text-sm font-medium">{selectedEmail.to}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
                <p className="text-sm font-medium">{selectedEmail.subject}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <p className="text-sm">{selectedEmail.date}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {selectedEmail.status}
                </span>
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Message</Label>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/60">
                  <p className="text-sm whitespace-pre-wrap">{selectedEmail.body}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-4 sm:p-6 border-t border-border/40">
              <Button variant="outline" onClick={() => setViewEmailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEmailModal(false)}>
          <div className="bg-background border border-border/60 shadow-2xl rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40">
              <h2 className="text-base sm:text-lg font-semibold">Send Email</h2>
              <button onClick={() => setEmailModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to" className="text-xs font-medium">To</Label>
                <Input
                  id="to"
                  value={emailContent.to}
                  onChange={(e) => setEmailContent({ ...emailContent, to: e.target.value })}
                  className="h-10 bg-muted/30 border-border/60"
                  disabled
                />
              </div>

              {!showEmailForm ? (
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Select Email Type</Label>
                  {Object.keys(emailTemplates).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSelectEmailType(type)}
                      className="w-full text-left p-4 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{type}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {emailTemplates[type].subject}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Email Type</Label>
                      <button
                        onClick={() => { setShowEmailForm(false); setEmailType("") }}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm font-medium text-primary">{emailType}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-medium">Subject</Label>
                    <Input
                      id="subject"
                      value={emailContent.subject}
                      onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                      className="h-10 bg-muted/30 border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body" className="text-xs font-medium">Message</Label>
                    <textarea
                      id="body"
                      value={emailContent.body}
                      onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleSend}
                      disabled={sending || !emailContent.subject || !emailContent.body}
                      className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                    >
                      {sending ? "Sending..." : "Send Email"}
                    </Button>
                    <Button variant="outline" onClick={() => setEmailModal(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}