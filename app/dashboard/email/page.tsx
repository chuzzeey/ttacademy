"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { AlertCircle, Check, Clock3, Copy, LoaderCircle, Mail, Search, Send, Users, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { academyEmailAccent, emailTemplates, ensurePersonalization, renderEmailText } from "@/lib/email/templates"
import { createEmailHtml } from "@/lib/email/render-html"
import { EmailComposer } from "@/components/email-composer"
import { formatEmailBulletLines, formatEmailPaymentButton, formatEmailSocialLinks, formatEmailWhatsAppCommunityLink, plainTextFromEmailHtml, plainTextToEmailHtml, sanitizeEmailHtml } from "@/lib/email/sanitize"

type Student = {
  id: string
  name: string
  email: string
  course: string
  student_code?: string
}

type EmailLog = {
  id: string
  recipient_name: string
  recipient_email: string
  student_code: string
  template_id: string
  subject: string
  body_text: string
  banner_headline: string | null
  banner_subtitle: string | null
  status: "sent" | "failed" | "bounced"
  error_message: string | null
  smtp_message_id: string | null
  sent_at: string | null
  created_at: string
}

type EmailSendProgress = {
  completed: number
  total: number
  sent: number
  failed: number
}

type EmailSendOutcome = "sending" | "success" | "partial" | "failed"
type TemplateWithHtml = (typeof emailTemplates)[number] & {
  bodyHtml?: string
  bannerHeadline?: string
  bannerSubtitle?: string
}

type EmailSendResult = {
  studentId: string
  status: "sent" | "failed"
  error?: string
}

type EmailSendEvent =
  | {
      type: "stage"
      stage: string
    }
  | ({ type: "progress" } & EmailSendProgress)
  | {
      type: "complete"
      sent: number
      failed: number
      results: EmailSendResult[]
      error?: string
    }

const initialTemplate = emailTemplates[0]
const previewStudent = { name: "Amah Precious", studentCode: "TTB 457837", course: "cybersecurity" }
const itemsPerPage = 10

export default function EmailPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate.id)
  const [templateCatalog, setTemplateCatalog] = useState<TemplateWithHtml[]>(emailTemplates)
  const [activeTab, setActiveTab] = useState("compose")
  const [subject, setSubject] = useState(initialTemplate.subject)
  const [messageBody, setMessageBody] = useState(initialTemplate.body)
  const [messageBodyHtml, setMessageBodyHtml] = useState(() => plainTextToEmailHtml(initialTemplate.body))
  const [bannerHeadline, setBannerHeadline] = useState(initialTemplate.name)
  const [bannerSubtitle, setBannerSubtitle] = useState(initialTemplate.description)
  const [previewName, setPreviewName] = useState(previewStudent.name)
  const [previewFrameHeight, setPreviewFrameHeight] = useState(800)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(() => new Set())
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState("")
  const [historyReady, setHistoryReady] = useState(false)
  const [senderName, setSenderName] = useState("Tech Trailblazer Academy")
  const [senderAddress, setSenderAddress] = useState("")
  const [replyTo, setReplyTo] = useState("")
  const [smtpReady, setSmtpReady] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendOutcome, setSendOutcome] = useState<EmailSendOutcome>("sending")
  const [sendStage, setSendStage] = useState("Preparing your email…")
  const [sendProgress, setSendProgress] = useState<EmailSendProgress>({ completed: 0, total: 0, sent: 0, failed: 0 })
  const [sendMessage, setSendMessage] = useState("")
  const [sendError, setSendError] = useState("")
  const [copiedStudentId, setCopiedStudentId] = useState("")
  const [copyError, setCopyError] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle")

  const copyStudentId = async (studentId: string) => {
    try {
      await navigator.clipboard.writeText(studentId)
      setCopiedStudentId(studentId)
      setCopyError("")
    } catch (error) {
      console.error("Student ID clipboard copy failed:", error)
      setCopyError("Unable to copy the student ID. Check clipboard permissions and try again.")
      setCopiedStudentId("")
    }
  }

  useEffect(() => {
    if (!copiedStudentId) return
    const timeout = window.setTimeout(() => setCopiedStudentId(""), 3000)
    return () => window.clearTimeout(timeout)
  }, [copiedStudentId])

  const fetchStudents = useCallback(async (initialLoad = false) => {
    if (initialLoad) setLoading(true)
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
      if (initialLoad) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStudents(true)
  }, [fetchStudents])

  const fetchEmailHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError("")
    setHistoryReady(false)
    try {
      const response = await fetch("/api/admin/email-history", { cache: "no-store" })
      const result = await response.json()
      if (result.sender) {
        setSenderName(result.sender.name || "Tech Trailblazer Academy")
        setSenderAddress(result.sender.address || "")
        setReplyTo(result.sender.replyTo || "")
        setSmtpReady(result.sender.configured === true)
      }
      if (!response.ok) throw new Error(result.error || "Unable to load email history.")
      if (!Array.isArray(result.data)) throw new Error("The email history response was invalid.")
      setEmailHistory(result.data)
      setHistoryReady(true)
    } catch (error) {
      setHistoryReady(false)
      setHistoryError(error instanceof Error ? error.message : "Unable to load email history.")
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchEmailHistory()
  }, [fetchEmailHistory])

  useEffect(() => {
    void fetch("/api/admin/email-templates", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !Array.isArray(result.data)) throw new Error(result.error || "Unable to load saved templates.")
        setTemplateCatalog((current) => current.map((template) => {
          const saved = result.data.find((item: { id?: string }) => item.id === template.id)
          const bodyHtml = formatEmailSocialLinks(formatEmailWhatsAppCommunityLink(formatEmailPaymentButton(formatEmailBulletLines(sanitizeEmailHtml(saved?.body_html || "")))))
          return saved ? {
            ...template,
            subject: saved.subject,
            body: plainTextFromEmailHtml(bodyHtml),
            bodyHtml,
            bannerHeadline: saved.banner_headline || template.name,
            bannerSubtitle: saved.banner_subtitle || template.description,
          } : template
        }))
        const saved = result.data.find((item: { id?: string }) => item.id === selectedTemplate)
        if (saved) {
          setSubject(saved.subject)
          setBannerHeadline(saved.banner_headline || saved.name)
          setBannerSubtitle(saved.banner_subtitle || saved.description)
          const bodyHtml = formatEmailSocialLinks(formatEmailWhatsAppCommunityLink(formatEmailPaymentButton(formatEmailBulletLines(sanitizeEmailHtml(saved.body_html)))))
          setMessageBody(plainTextFromEmailHtml(bodyHtml))
          setMessageBodyHtml(bodyHtml)
        }
      })
      .catch((error) => console.error("Saved email template loading failed:", error))
  }, [selectedTemplate])

  useEffect(() => {
    if (!sending) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [sending])

  useEffect(() => {
    const supabase = createClient()
    let refreshTimer: number | undefined
    const channel = supabase
      .channel("admin-email-student-directory")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => void fetchStudents(), 150)
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Live student directory updates unavailable:", error ?? status)
        }
      })

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      void supabase.removeChannel(channel)
    }
  }, [fetchStudents])

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
  const selectedTemplateDetails = templateCatalog.find(({ id }) => id === selectedTemplate)
  const selectedPreviewStudent = students.find((student) => selectedStudentIds.has(student.id))
  const previewText = renderEmailText(ensurePersonalization(messageBody), {
    ...previewStudent,
    studentCode: selectedPreviewStudent?.student_code || previewStudent.studentCode,
    name: previewName || "Your name",
    course: selectedPreviewStudent?.course || previewStudent.course,
  })
  const previewHtml = createEmailHtml(
    previewText,
    replyTo || undefined,
    {
      bannerHeadline: bannerHeadline || "Your Academy update",
      bannerSubtitle: bannerSubtitle || "An update from the Tech Trailblazer Academy team.",
    },
    selectedPreviewStudent?.course || previewStudent.course,
    messageBodyHtml,
  )
  const sentCount = emailHistory.filter(({ status }) => status === "sent").length
  const failedCount = emailHistory.filter(({ status }) => status === "failed").length
  const bouncedCount = emailHistory.filter(({ status }) => status === "bounced").length
  const allPageStudentsSelected =
    pageStudents.length > 0 && pageStudents.every(({ id }) => selectedStudentIds.has(id))

  const changeTemplate = (templateId: string) => {
    const template = templateCatalog.find(({ id }) => id === templateId)
    if (!template) return
    setSelectedTemplate(template.id)
    setSubject(template.subject)
    setMessageBody(template.body)
    setMessageBodyHtml("bodyHtml" in template && template.bodyHtml ? template.bodyHtml : plainTextToEmailHtml(template.body))
    setBannerHeadline(template.bannerHeadline || template.name)
    setBannerSubtitle(template.bannerSubtitle || template.description)
    setSendMessage("")
    setSendError("")
  }

  const saveTemplate = async () => {
    setSaveState("saving")
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTemplate,
          subject,
          bodyHtml: sanitizeEmailHtml(messageBodyHtml),
          bannerHeadline,
          bannerSubtitle,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to save template.")
      setMessageBody(plainTextFromEmailHtml(messageBodyHtml))
      setTemplateCatalog((current) => current.map((template) => template.id === selectedTemplate
        ? { ...template, subject, body: plainTextFromEmailHtml(messageBodyHtml), bodyHtml: messageBodyHtml, bannerHeadline, bannerSubtitle }
        : template))
      setSaveState("saved")
    } catch (error) {
      console.error("Email template save failed:", error)
      setSaveState("failed")
    }
  }

  const sendEmail = async () => {
    if (!selectedTemplate || selectedStudentIds.size === 0 || sending) return
    const recipientCount = selectedStudentIds.size
    setSending(true)
    setSendOutcome("sending")
    setSendStage("Preparing your email…")
    setSendProgress({ completed: 0, total: recipientCount, sent: 0, failed: 0 })
    setSendMessage("")
    setSendError("")
    try {
      const response = await fetch("/api/admin/email-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          subject,
          body: ensurePersonalization(messageBody),
          bodyHtml: messageBodyHtml,
          bannerHeadline,
          bannerSubtitle,
          studentIds: [...selectedStudentIds],
        }),
      })
      const contentType = response.headers.get("content-type") || ""
      if (!response.ok && !contentType.includes("application/x-ndjson")) {
        const result = await response.json()
        throw new Error(result.error || "Unable to send email.")
      }
      if (!contentType.includes("application/x-ndjson") || !response.body) {
        throw new Error("The email service did not return delivery progress. Refresh the page and try again.")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let finalResult: Extract<EmailSendEvent, { type: "complete" }> | undefined
      const processLine = (line: string) => {
        if (!line.trim()) return
        const event = JSON.parse(line) as EmailSendEvent
        if (event.type === "stage") {
          setSendStage(event.stage)
        } else if (event.type === "progress") {
          setSendProgress({
            completed: event.completed,
            total: event.total,
            sent: event.sent,
            failed: event.failed,
          })
        } else {
          finalResult = event
          setSendProgress({
            completed: event.results.length,
            total: recipientCount,
            sent: event.sent,
            failed: event.failed,
          })
        }
      }
      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        lines.forEach(processLine)
        if (done) break
      }
      if (buffer.trim()) processLine(buffer)
      if (!finalResult) {
        throw new Error("The connection ended before email delivery finished. Check email history before retrying.")
      }
      const result = finalResult
      const sentIds = new Set(
        result.results.filter((item) => item.status === "sent").map((item) => item.studentId),
      )
      setSelectedStudentIds((current) => new Set([...current].filter((id) => !sentIds.has(id))))
      if (result.results.length > 0 || !result.error) {
        setSendMessage(`${result.sent} email${result.sent === 1 ? "" : "s"} sent${result.failed ? `; ${result.failed} failed` : ""}.`)
      }
      setSendOutcome(
        result.failed === 0 && !result.error
          ? "success"
          : result.sent > 0
            ? "partial"
            : "failed",
      )
      if (result.failed) {
        const firstFailure = result.results.find((item) => item.status === "failed")
        if (firstFailure?.error) setSendError(firstFailure.error)
      }
      if (result.error) setSendError(result.error)
      void fetchEmailHistory()
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Unable to send email.")
      setSendOutcome("failed")
    } finally {
      await new Promise((resolve) => window.setTimeout(resolve, 3500))
      setSending(false)
    }
  }

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

      {(!smtpReady || !historyReady) && (
        <div className="mb-3 flex gap-2 border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-950 sm:mb-6 sm:gap-3 sm:p-4 sm:text-sm">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <div>
            <p className="font-medium">
              {historyLoading
                ? "Checking email configuration..."
                : !smtpReady
                  ? "SMTP sender is not configured"
                  : "Email history is unavailable"}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
              {!smtpReady
                ? "Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM (or SMTP_USER) in the server environment to enable sending."
                : historyLoading
                  ? "Checking email history storage before enabling sending."
                  : historyError || "Sending is paused to avoid unrecorded email attempts."}
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-3 h-auto w-full justify-start gap-3 rounded-none bg-transparent p-0 sm:mb-5 sm:gap-7">
          <TabsTrigger value="compose" className="relative h-9 flex-none rounded-none bg-transparent px-2 text-xs text-muted-foreground shadow-none after:absolute after:-inset-x-1 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-emerald-700 after:transition-transform hover:!bg-transparent hover:text-foreground focus:!bg-transparent focus-visible:!border-transparent data-[state=active]:!border-transparent data-[state=active]:!bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-800 data-[state=active]:!shadow-none data-[state=active]:after:scale-x-100 sm:h-11 sm:px-4 sm:text-sm sm:after:-inset-x-2">
            <Mail aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Compose & send
          </TabsTrigger>
          <TabsTrigger value="history" className="relative h-9 flex-none rounded-none bg-transparent px-2 text-xs text-muted-foreground shadow-none after:absolute after:-inset-x-1 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-emerald-700 after:transition-transform hover:!bg-transparent hover:text-foreground focus:!bg-transparent focus-visible:!border-transparent data-[state=active]:!border-transparent data-[state=active]:!bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-800 data-[state=active]:!shadow-none data-[state=active]:after:scale-x-100 sm:h-11 sm:px-4 sm:text-sm sm:after:-inset-x-2">
            <Clock3 aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Email history
            {emailHistory.length > 0 && <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] text-emerald-800 sm:px-2 sm:text-[10px]">{emailHistory.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-7 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
        {[
          { label: "Learners", value: loading ? "—" : students.length, description: "Available in the directory" },
          { label: "Selected", value: selectedStudentIds.size, description: "Recipients for the next send" },
          { label: "Sent", value: sentCount, description: "Accepted by the SMTP server" },
          { label: "Failed", value: failedCount, description: "SMTP send attempts not accepted" },
          { label: "Bounced", value: bouncedCount, description: "Reported as undeliverable" },
        ].map((stat) => (
          <Card key={stat.label} className="dashboard-card stat-card gap-1 py-2 sm:gap-6 sm:py-6">
            <CardContent className="p-2.5 sm:p-5">
              <p className="text-[10px] text-muted-foreground sm:text-xs">{stat.label}</p>
              <p className="mt-1 text-base font-semibold sm:mt-2 sm:text-xl">{stat.value}</p>
              <p className="mt-0.5 text-[9px] leading-3 text-muted-foreground sm:text-xs sm:leading-normal">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="dashboard-card mb-3 gap-2 py-2 sm:mb-5 sm:gap-6 sm:py-6">
        <CardHeader className="gap-1 px-2.5 pb-2 sm:gap-2 sm:px-6 sm:pb-4">
          <CardTitle className="text-sm font-medium sm:text-base">Compose a follow-up</CardTitle>
          <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
            Preview the personalized email before sending.
          </p>
          <div className="grid gap-2 pt-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-end sm:gap-4 sm:pt-2">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email-type" className="text-[11px] font-medium sm:text-xs">Email type</Label>
              <Select value={selectedTemplate} onValueChange={changeTemplate}>
                <SelectTrigger id="email-type" className="h-9 w-full rounded-lg bg-background text-xs sm:h-11 sm:rounded-xl sm:text-sm">
                  <SelectValue placeholder="Select an email type" />
                </SelectTrigger>
                <SelectContent>
                  {templateCatalog.map((emailType) => (
                    <SelectItem key={emailType.id} value={emailType.id}>
                      {emailType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedTemplateDetails && (
            <div role="status" className="mt-2 flex items-start gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-2 text-[11px] leading-4 text-emerald-900 sm:mt-3 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-xs sm:leading-normal">
              <Mail aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span>{selectedTemplateDetails.description}</span>
            </div>
          )}
          <div className="mt-2 grid gap-5 sm:mt-4 sm:gap-6 xl:grid-cols-2 xl:items-start">
            <section aria-label="Email editor" className="min-w-0 space-y-3">
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="email-title" className="text-xs">Email title</Label>
                    <Input id="email-title" value={bannerHeadline} maxLength={100} onChange={(event) => { setBannerHeadline(event.target.value); setSaveState("idle") }} className="mt-1 h-10 bg-white text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="email-subtitle" className="text-xs">Email subtitle</Label>
                    <Input id="email-subtitle" value={bannerSubtitle} maxLength={180} onChange={(event) => { setBannerSubtitle(event.target.value); setSaveState("idle") }} className="mt-1 h-10 bg-white text-sm" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject" className="text-xs">Subject</Label>
                  <Input id="subject" value={subject} onChange={(event) => { setSubject(event.target.value); setSaveState("idle") }} className="mt-1 h-10 bg-white text-sm" />
                </div>
                <EmailComposer value={messageBodyHtml} onChange={(html) => { setMessageBodyHtml(html); setMessageBody(plainTextFromEmailHtml(html)); setSaveState("idle") }} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{saveState === "saving" ? "Saving changes…" : saveState === "saved" ? "Changes saved" : saveState === "failed" ? "Save failed — your edits are still here." : "Unsaved changes"}</span>
                  <Button type="button" onClick={() => void saveTemplate()} disabled={saveState === "saving"} className="rounded-xl">{saveState === "saving" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Save changes</Button>
                </div>
              </div>
            </section>
            <section aria-label="Live email preview" className="min-w-0 space-y-3">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="preview-name" className="text-[11px] font-medium sm:text-xs">Preview name</Label>
                <Input id="preview-name" value={previewName} onChange={(event) => setPreviewName(event.target.value)} className="h-8 rounded-lg text-xs sm:h-10 sm:rounded-xl sm:text-sm" />
              </div>
              <div className="email-preview-light mx-auto w-full max-w-[600px] overflow-hidden rounded-xl border border-slate-200 bg-[#fafafa] shadow-sm" style={{ colorScheme: "light", backgroundColor: "#fafafa" }}>
                <div className="bg-white px-2.5 py-2 text-[10px] leading-4 sm:px-4 sm:py-2.5 sm:text-[11px]">
                  <p className="truncate"><span className="font-medium text-slate-500">From</span> {senderName}{senderAddress ? ` <${senderAddress}>` : ""}</p>
                  {replyTo && <p className="mt-1 truncate"><span className="font-medium text-slate-500">Reply-to</span> {replyTo}</p>}
                  <p className="mt-1 truncate"><span className="font-medium text-slate-500">To</span> {previewName || "Your name"} &lt;learner@example.com&gt;</p>
                  <p className="mt-1"><span className="font-medium text-slate-500">Subject</span> {subject || "(no subject)"}</p>
                </div>
                <iframe
                  title="Personalized email preview"
                  srcDoc={previewHtml}
                  sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  className="block w-full border-0"
                  style={{ height: previewFrameHeight, colorScheme: "light" }}
                  onLoad={(event) => {
                    const frameDocument = event.currentTarget.contentDocument
                    if (!frameDocument) return
                    const resizeFrame = () => {
                      setPreviewFrameHeight(Math.max(320, frameDocument.documentElement.scrollHeight))
                    }
                    resizeFrame()
                    new ResizeObserver(resizeFrame).observe(frameDocument.documentElement)
                  }}
                />
              </div>
            </section>
          </div>
          {sendMessage && <p role="status" className="mt-3 text-sm font-medium text-emerald-800">{sendMessage}</p>}
          {sendError && <p role="alert" className="mt-2 text-sm text-rose-700">{sendError}</p>}
          {copyError && <p role="alert" className="mt-2 text-sm text-rose-700">{copyError}</p>}
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
                          <Badge variant="outline" className="border-emerald-200 text-[10px] font-medium text-emerald-800">Ready to email</Badge>
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
        <Button disabled={!selectedStudentIds.size || !smtpReady || !historyReady || sending} onClick={() => void sendEmail()} className="h-10 w-full rounded-xl sm:w-auto">
          <Send aria-hidden="true" className="mr-2 h-4 w-4" />
          {sending ? "Sending…" : `Send to ${selectedStudentIds.size || 0}`}
        </Button>
      </div>
        </TabsContent>

        <TabsContent value="history">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Sent", value: sentCount, description: "Accepted by the SMTP server" },
          { label: "Failed", value: failedCount, description: "SMTP send attempts not accepted" },
          { label: "Bounced", value: bouncedCount, description: "Provider-reported delivery failures" },
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
      <Card className="dashboard-card mt-5">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base font-medium">Email history</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">The latest 100 individual recipient attempts, including the exact message sent.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void fetchEmailHistory()} disabled={historyLoading}>
              Refresh history
            </Button>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            “Sent” means accepted by the SMTP server. Delivery to an inbox or later bounce reports depend on whether your SMTP provider exposes bounce events.
          </p>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8" role="status" aria-label="Loading email history">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-700" />
            </div>
          ) : historyError ? (
            <div role="alert" className="py-8 text-center">
              <p className="text-sm text-rose-700">{historyError}</p>
              <Button variant="outline" className="mt-3" onClick={() => void fetchEmailHistory()}>Retry</Button>
            </div>
          ) : emailHistory.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Clock3 aria-hidden="true" className="mx-auto mb-2 h-5 w-5" />
              No email attempts yet.
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((log) => (
                <details key={log.id} className="group rounded-xl border border-border/70 bg-background">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                    <span className="min-w-[170px] flex-1">
                      <span className="block truncate text-sm font-medium">{log.recipient_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{log.recipient_email} · ID {log.student_code}</span>
                    </span>
                    <span className="min-w-[145px] flex-1 truncate text-xs text-muted-foreground">
                      {templateCatalog.find(({ id }) => id === log.template_id)?.name ?? log.template_id}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        log.status === "sent"
                          ? "border-emerald-200 text-emerald-800"
                          : log.status === "bounced"
                            ? "border-orange-200 text-orange-800"
                            : "border-rose-200 text-rose-800"
                      }
                    >
                      {log.status}
                    </Badge>
                    <time className="text-xs text-muted-foreground" dateTime={log.created_at}>
                      {new Date(log.created_at).toLocaleString()}
                    </time>
                    <span className="w-full truncate text-xs text-muted-foreground">{log.subject}</span>
                  </summary>
                  <div className="border-t border-border/60 px-4 py-3">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Student ID</span>
                      <code className="rounded bg-muted/50 px-2 py-1 font-medium text-foreground">{log.student_code}</code>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void copyStudentId(log.student_code)} className="h-7 px-2 text-xs text-emerald-800">
                        {copiedStudentId === log.student_code ? <Check aria-hidden="true" className="mr-1 h-3.5 w-3.5" /> : <Copy aria-hidden="true" className="mr-1 h-3.5 w-3.5" />}
                        {copiedStudentId === log.student_code ? "Copied" : "Copy ID"}
                      </Button>
                    </div>
                    {log.banner_headline && (
                      <div className="mb-3 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50">
                        <div className="border-l-2 bg-white px-4 py-3" style={{ borderColor: academyEmailAccent }}>
                          <p className="text-sm font-semibold text-[#183b2b]">{log.banner_headline}</p>
                          <p className="mt-1 text-xs text-slate-500">{log.banner_subtitle}</p>
                        </div>
                      </div>
                    )}
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Message sent</p>
                    <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 font-sans text-xs leading-5">{log.body_text}</pre>
                    {copyError && <p role="alert" className="mt-2 text-xs text-rose-700">{copyError}</p>}
                    {log.error_message && <p className="mt-2 text-xs text-rose-700">Delivery error: {log.error_message}</p>}
                    {log.smtp_message_id && <p className="mt-2 break-all text-[10px] text-muted-foreground">SMTP message ID: {log.smtp_message_id}</p>}
                  </div>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
      {sending && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 text-center shadow-2xl sm:p-8">
            {sendOutcome === "sending" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <LoaderCircle aria-hidden="true" className="h-9 w-9 animate-spin text-emerald-700" />
                </div>
                <p className="mt-5 text-lg font-semibold text-foreground">{sendStage}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sendProgress.completed} of {sendProgress.total} processed
                </p>
                <div
                  className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Email delivery progress"
                  aria-valuemin={0}
                  aria-valuemax={sendProgress.total}
                  aria-valuenow={sendProgress.completed}
                >
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
                    style={{ width: `${sendProgress.total ? (sendProgress.completed / sendProgress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {sendProgress.sent} sent
                  {sendProgress.failed > 0 && ` · ${sendProgress.failed} failed`}
                  {sendProgress.total > 1 && " · Sending securely to each learner"}
                </p>
              </>
            ) : (
              <>
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  sendOutcome === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : sendOutcome === "partial"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                }`}>
                  {sendOutcome === "success" ? (
                    <Check aria-hidden="true" className="h-9 w-9" strokeWidth={3} />
                  ) : sendOutcome === "partial" ? (
                    <AlertCircle aria-hidden="true" className="h-9 w-9" />
                  ) : (
                    <X aria-hidden="true" className="h-9 w-9" strokeWidth={3} />
                  )}
                </div>
                <p className="mt-5 text-lg font-semibold text-foreground">
                  {sendOutcome === "success"
                    ? "Email sent successfully"
                    : sendOutcome === "partial"
                      ? "Sending completed with some failures"
                      : "Email sending failed"}
                </p>
                {sendMessage && <p className="mt-1 text-sm text-muted-foreground">{sendMessage}</p>}
                {sendError && <p className="mt-3 text-sm text-red-700">{sendError}</p>}
                <p className="mt-4 text-xs text-muted-foreground">
                  {sendProgress.sent} sent · {sendProgress.failed} failed
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
