"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Checkbox } from "../components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { AlertCircle, Mail, Search, Users, X } from "lucide-react"

type Student = {
  id: string
  name: string
  email: string
  course: string
}

const emailTypes = [
  {
    id: "welcome",
    name: "Welcome email",
    description: "Welcome a learner and share what to expect next.",
    subject: "Welcome to Tech Trailblazer Academy!",
  },
  {
    id: "payment-confirmation",
    name: "Payment confirmation",
    description: "Confirm a learner's payment and enrollment status.",
    subject: "Payment Confirmation - Tech Trailblazer Academy",
  },
  {
    id: "payment-reminder",
    name: "Payment reminder",
    description: "Remind a learner about an outstanding payment.",
    subject: "A reminder about your course payment",
  },
  {
    id: "installment-update",
    name: "Installment update",
    description: "Share an update about an installment payment.",
    subject: "Update on your installment payment",
  },
  {
    id: "course-next-steps",
    name: "Course next steps",
    description: "Explain the next steps after a learner registers.",
    subject: "Your next steps with Tech Trailblazer Academy",
  },
] as const

const itemsPerPage = 10

export default function EmailPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(() => new Set())

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
  const selectedTemplateDetails = emailTypes.find(({ id }) => id === selectedTemplate)
  const allPageStudentsSelected =
    pageStudents.length > 0 && pageStudents.every(({ id }) => selectedStudentIds.has(id))

  const toggleStudent = (studentId: string, checked: boolean) => {
    setSelectedStudentIds((current) => {
      const next = new Set(current)
      if (checked) next.add(studentId)
      else next.delete(studentId)
      return next
    })
  }

  const toggleCurrentPage = (checked: boolean) => {
    setSelectedStudentIds((current) => {
      const next = new Set(current)
      for (const student of pageStudents) {
        if (checked) next.add(student.id)
        else next.delete(student.id)
      }
      return next
    })
  }

  const clearSelection = () => setSelectedStudentIds(new Set())

  return (
    <>
      <PageHeader
        title="Email Follow-up"
        description="Choose a message type and select the learners you want to contact."
      />

      <div className="mb-6 flex gap-3 border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">Email sending is coming soon</p>
          <p className="mt-1 text-xs leading-5 text-amber-900/80">
            You can prepare a message type and select one or more learners. Sending and delivery tracking are not available yet.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:mb-7 sm:grid-cols-3">
        {[
          { label: "Learners", value: loading ? "—" : students.length, description: "Available in the directory" },
          { label: "Selected", value: selectedStudentIds.size, description: "Recipients for the next send" },
          { label: "Email delivery", value: "Coming soon", description: "Sending is not enabled yet" },
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

      <Card className="dashboard-card mb-5">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Compose a follow-up</CardTitle>
          <p className="text-xs leading-5 text-muted-foreground">
            Choose one of the planned email types. Message editing and delivery will be enabled in a future update.
          </p>
          <div className="grid gap-4 pt-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="email-type" className="text-xs font-medium">Email type</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="email-type" className="h-11 w-full rounded-xl bg-background">
                  <SelectValue placeholder="Select an email type" />
                </SelectTrigger>
                <SelectContent>
                  {emailTypes.map((emailType) => (
                    <SelectItem key={emailType.id} value={emailType.id}>
                      {emailType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplateDetails ? (
              <div className="min-h-11 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Planned subject</p>
                <p className="mt-1 truncate text-sm font-medium">{selectedTemplateDetails.subject}</p>
              </div>
            ) : (
              <p className="pb-1 text-xs text-muted-foreground">
                Select a type to preview its purpose and planned subject.
              </p>
            )}
          </div>
          {selectedTemplateDetails && (
            <div role="status" className="mt-1 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 text-xs text-emerald-900">
              <Mail aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{selectedTemplateDetails.description} This template is coming soon.</span>
            </div>
          )}
        </CardHeader>
      </Card>

      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-medium">Choose recipients</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Select learners individually or select everyone on the current page.
              </p>
            </div>
            {selectedStudentIds.size > 0 && (
              <Button variant="outline" size="sm" onClick={clearSelection} className="h-9 self-start rounded-xl sm:self-auto">
                Clear selection
              </Button>
            )}
          </div>
          <div className="relative mt-4 w-full sm:w-[340px]">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <X aria-hidden="true" className="h-3.5 w-3.5" />
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
              <Search aria-hidden="true" className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No students match your search." : "No students found."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-12 px-3 py-3 text-left">
                        <Checkbox
                          aria-label="Select all learners on this page"
                          checked={allPageStudentsSelected}
                          onCheckedChange={(checked) => toggleCurrentPage(checked === true)}
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Learner</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Course</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-3">
                          <Checkbox
                            aria-label={`Select ${student.name}`}
                            checked={selectedStudentIds.has(student.id)}
                            onCheckedChange={(checked) => toggleStudent(student.id, checked === true)}
                          />
                        </td>
                        <td className="px-3 py-3 text-sm font-medium">{student.name}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{student.email}</td>
                        <td className="px-3 py-3"><Badge variant="secondary" className="text-xs font-normal">{student.course}</Badge></td>
                        <td className="px-3 py-3 text-right">
                          <Badge variant="outline" className="border-amber-200 text-[10px] font-medium text-amber-800">Coming soon</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 lg:hidden">
                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3">
                  <Checkbox
                    aria-label="Select all learners on this page"
                    checked={allPageStudentsSelected}
                    onCheckedChange={(checked) => toggleCurrentPage(checked === true)}
                  />
                  <span className="text-xs font-medium">Select all on this page</span>
                </label>
                {pageStudents.map((student) => (
                  <label key={student.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/20">
                    <Checkbox
                      aria-label={`Select ${student.name}`}
                      checked={selectedStudentIds.has(student.id)}
                      onCheckedChange={(checked) => toggleStudent(student.id, checked === true)}
                      className="mt-0.5"
                    />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Users aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{student.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{student.email}</span>
                      <Badge variant="secondary" className="mt-2 text-[10px] font-normal">{student.course}</Badge>
                    </span>
                  </label>
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

      <div className="sticky bottom-3 z-10 mt-5 flex flex-col gap-3 border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div>
          <p className="text-sm font-medium">
            {selectedStudentIds.size} {selectedStudentIds.size === 1 ? "learner" : "learners"} selected
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectedTemplateDetails ? selectedTemplateDetails.name : "Choose an email type above"}
          </p>
        </div>
        <Button disabled className="h-10 w-full rounded-xl sm:w-auto">
          <Mail aria-hidden="true" className="mr-2 h-4 w-4" />
          Sending feature coming soon
        </Button>
      </div>
    </>
  )
}
