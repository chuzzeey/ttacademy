"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { AlertCircle, Mail, Search, User, X } from "lucide-react"

type Student = {
  id: string
  name: string
  email: string
  course: string
}

const emailTemplates: Record<string, { subject: string; body: string }> = {
  "Welcome email": {
    subject: "Welcome to Tech Trailblazer Academy!",
    body: "Dear Student,\n\nWelcome to Tech Trailblazer Academy! We're excited to have you on board.\n\nWe are committed to helping you succeed in your learning journey. Our team is here to support you every step of the way.\n\nIf you have any questions, feel free to reach out to us.\n\nBest regards,\nTech Trailblazer Academy Team",
  },
  "Payment confirmation": {
    subject: "Payment Confirmation - Tech Trailblazer Academy",
    body: "Dear Student,\n\nThank you for your payment! We're pleased to confirm that your payment has been received successfully.\n\nYour enrollment is now active and you can start accessing your course materials immediately.\n\nIf you have any questions regarding your payment or enrollment, please don't hesitate to contact us.\n\nBest regards,\nTech Trailblazer Academy Team",
  },
}

const itemsPerPage = 10

export default function EmailPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [emailContent, setEmailContent] = useState({ subject: "", body: "" })
  const [draftNotice, setDraftNotice] = useState("")

  const fetchStudents = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const response = await fetch("/api/registrations", { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to load the student directory.")
      if (!Array.isArray(result.data)) throw new Error("The student directory response was invalid.")
      setStudents(result.data.map((student: Student) => ({
        id: student.id,
        name: student.name || "Unnamed learner",
        email: student.email,
        course: student.course || "Unspecified",
      })))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load the student directory.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchStudents()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query),
    )
  }, [students, searchQuery])

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const pageStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const openComposer = (student: Student) => {
    setSelectedStudent(student)
    setSelectedTemplate("")
    setEmailContent({ subject: "", body: "" })
    setDraftNotice("")
  }

  const createDraft = () => {
    if (!selectedStudent || !emailContent.subject.trim() || !emailContent.body.trim()) return
    const params = new URLSearchParams({
      subject: emailContent.subject,
      body: emailContent.body,
    })
    window.location.href = `mailto:${encodeURIComponent(selectedStudent.email)}?${params.toString()}`
    setDraftNotice("Your email app should open with this draft. Send it there to deliver; delivery is not tracked in this dashboard.")
    setSelectedStudent(null)
  }

  return (
    <>
      <PageHeader
        title="Email Follow-up"
        description="Prepare learner follow-ups using your device's email app."
      />

      <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          No email delivery service is connected. This page opens a draft in your default email app; it does not send messages or record delivery.
        </p>
      </div>

      {draftNotice && (
        <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {draftNotice}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-7 sm:grid-cols-3">
        {[
          { label: "Learners", value: loading ? "—" : students.length, description: "Available in the directory" },
          { label: "Courses", value: loading ? "—" : new Set(students.map(({ course }) => course)).size, description: "Represented in this list" },
          { label: "Delivery", value: "Not connected", description: "Drafts open in your email app" },
        ].map((stat) => (
          <Card key={stat.label} className="dashboard-card stat-card">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-lg font-semibold sm:text-xl">{stat.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Student Directory</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Find a learner and prepare a follow-up draft.</p>
          <div className="relative mt-4 w-full sm:w-[340px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search students"
              placeholder="Search by name, email, or course..."
              className="h-10 w-full rounded-xl bg-muted/30 pl-9 pr-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16" role="status" aria-label="Loading student directory">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
            </div>
          ) : loadError ? (
            <div role="alert" className="py-12 text-center">
              <p className="text-sm text-rose-700">{loadError}</p>
              <Button variant="outline" className="mt-4" onClick={() => void fetchStudents()}>Retry</Button>
            </div>
          ) : pageStudents.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No students match your search." : "No students found."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Learner</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Course</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-3 text-sm font-medium">{student.name}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{student.email}</td>
                        <td className="px-3 py-3"><Badge variant="secondary" className="text-xs font-normal">{student.course}</Badge></td>
                        <td className="px-3 py-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => openComposer(student)} className="h-9 rounded-xl">
                            <Mail className="mr-1.5 h-3.5 w-3.5" /> Prepare email
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 lg:hidden">
                {pageStudents.map((student) => (
                  <article key={student.id} className="space-y-3 rounded-xl border border-border/60 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{student.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-normal">{student.course}</Badge>
                    <Button variant="outline" size="sm" onClick={() => openComposer(student)} className="h-9 w-full rounded-xl">
                      <Mail className="mr-1.5 h-3.5 w-3.5" /> Prepare email draft
                    </Button>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
                <p className="text-center text-xs text-muted-foreground sm:text-left">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} learners
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</Button>
                    <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Next</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setSelectedStudent(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-compose-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border/60 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 p-5">
              <div>
                <h2 id="email-compose-title" className="text-base font-semibold">Prepare email draft</h2>
                <p className="mt-1 text-xs text-muted-foreground">To {selectedStudent.email}</p>
              </div>
              <button type="button" aria-label="Close email composer" onClick={() => setSelectedStudent(null)} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {!selectedTemplate ? (
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Choose a template</Label>
                  {Object.entries(emailTemplates).map(([name, template]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(name)
                        setEmailContent(template)
                      }}
                      className="w-full rounded-xl border border-border/60 p-4 text-left transition hover:border-amber-500/30 hover:bg-amber-500/5"
                    >
                      <p className="text-sm font-medium">{name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{template.subject}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{selectedTemplate}</p>
                    <button type="button" onClick={() => setSelectedTemplate("")} className="text-xs font-medium text-amber-700 hover:text-amber-800">Change template</button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject" className="text-xs font-medium">Subject</Label>
                    <Input id="email-subject" value={emailContent.subject} onChange={(event) => setEmailContent({ ...emailContent, subject: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-body" className="text-xs font-medium">Message</Label>
                    <textarea
                      id="email-body"
                      value={emailContent.body}
                      onChange={(event) => setEmailContent({ ...emailContent, body: event.target.value })}
                      rows={8}
                      className="w-full resize-y rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
                    <Button variant="outline" onClick={() => setSelectedStudent(null)} className="flex-1 rounded-xl">Cancel</Button>
                    <Button
                      onClick={createDraft}
                      disabled={!emailContent.subject.trim() || !emailContent.body.trim()}
                      className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Mail className="mr-2 h-4 w-4" /> Open email draft
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
