"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Check, Clock3, Eye, FileImage, LoaderCircle, Search, X, XCircle } from "lucide-react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { COURSE_CATALOG } from "@/lib/course-catalog"
import { createClient } from "@/lib/supabase/client"

type PaymentProof = {
  id: string
  student_code: string
  student_name: string
  student_email: string
  course: string
  mime_type: string
  file_size: number
  status: "pending" | "processing" | "approved" | "rejected"
  notification_status: "not_sent" | "sent" | "failed"
  notification_template_id: string | null
  notification_subject: string | null
  notification_error: string | null
  notification_attempted_at: string | null
  notification_sent_at: string | null
  rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
  imageUrl: string
}

const statuses = [
  { value: "all", label: "All proofs" },
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved proofs" },
  { value: "rejected", label: "Rejected proofs" },
]

const notificationStatuses = [
  { value: "all", label: "All email outcomes" },
  { value: "sent", label: "Email sent" },
  { value: "failed", label: "Email failed" },
  { value: "not_sent", label: "No email sent" },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

export default function PaymentProofsPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("pending")
  const [notificationStatus, setNotificationStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [workingId, setWorkingId] = useState("")
  const [selectedImage, setSelectedImage] = useState<PaymentProof | null>(null)
  const [rejectingProof, setRejectingProof] = useState<PaymentProof | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const loadProofs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set("q", search.trim())
      if (status !== "all") params.set("status", status)
      if (notificationStatus !== "all") params.set("notification_status", notificationStatus)
      const response = await fetch(`/api/admin/payment-proofs?${params}`, { cache: "no-store" })
      const result = await response.json() as { data?: PaymentProof[]; error?: string }
      if (!response.ok) throw new Error(result.error || "Unable to load payment proofs.")
      if (!Array.isArray(result.data)) throw new Error("The payment proof response is invalid.")
      setProofs(result.data)
      if (status === "pending" || status === "all") {
        const readResponse = await fetch("/api/admin/payment-proofs/notifications", { method: "POST" })
        if (!readResponse.ok) {
          const readResult = await readResponse.json() as { error?: string }
          throw new Error(readResult.error || "Payment proofs loaded, but notifications could not be marked as seen.")
        }
      }
    } catch (loadError) {
      console.error("Payment proof list loading failed:", loadError)
      setError(loadError instanceof Error ? loadError.message : "Unable to load payment proofs.")
    } finally {
      setLoading(false)
    }
  }, [notificationStatus, search, status])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProofs(), 250)
    return () => window.clearTimeout(timer)
  }, [loadProofs])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("admin-payment-proof-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_proofs" }, () => {
        void loadProofs()
      })
      .subscribe((subscriptionStatus, subscriptionError) => {
        if (subscriptionStatus === "CHANNEL_ERROR" || subscriptionStatus === "TIMED_OUT") {
          console.error("Live payment proof list updates unavailable:", subscriptionError ?? subscriptionStatus)
        }
      })
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadProofs])

  const reviewProof = async (proof: PaymentProof, action: "approved" | "rejected", reason?: string) => {
    setWorkingId(proof.id)
    setError("")
    setNotice("")
    try {
      const response = await fetch(`/api/admin/payment-proofs/${proof.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      })
      const result = await response.json() as { error?: string; warning?: string }
      if (!response.ok) throw new Error(result.error || "Unable to update this proof.")
      if (result.warning) setNotice(result.warning)
      else setNotice(action === "approved" ? "Payment proof approved and confirmation email sent." : "Proof rejected and notification email sent.")
      setRejectingProof(null)
      setRejectionReason("")
      await loadProofs()
    } catch (reviewError) {
      console.error("Payment proof review failed:", reviewError)
      setError(reviewError instanceof Error ? reviewError.message : "Unable to update this proof.")
    } finally {
      setWorkingId("")
    }
  }

  const pendingCount = useMemo(() => proofs.filter(({ status: proofStatus }) => proofStatus === "pending").length, [proofs])

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Proofs" description="Review receipt images submitted by learners and record payment decisions." />

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock3 aria-hidden="true" className="h-4 w-4 text-amber-600" />
              {pendingCount} pending in this view
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:flex">
              <label className="relative block sm:w-64">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student ID" aria-label="Search proofs by student ID" className="pl-9" />
              </label>
              <select aria-label="Filter payment proofs by status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                {statuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select aria-label="Filter proofs by email delivery status" value={notificationStatus} onChange={(event) => setNotificationStatus(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                {notificationStatuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>

          {error && <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {notice && <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{notice}</div>}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />Loading payment proofs…</div>
          ) : proofs.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-5 text-center">
              <FileImage aria-hidden="true" className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-800">No payment proofs found</p>
              <p className="mt-1 text-xs text-slate-500">{search ? "Try another student ID." : "New learner submissions will appear here."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Learner</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Course</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Decision email</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Receipt</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {proofs.map((proof) => (
                    <tr key={proof.id} className="align-middle">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{proof.student_name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{proof.student_code}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{proof.student_email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{COURSE_CATALOG.find(({ title }) => title.toLowerCase() === proof.course.toLowerCase())?.title || proof.course}</td>
                      <td className="px-4 py-4 text-xs text-slate-600">{formatDate(proof.created_at)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          proof.status === "approved" ? "bg-blue-50 text-blue-700"
                            : proof.status === "rejected" ? "bg-rose-50 text-rose-700"
                              : proof.status === "processing" ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                        }`}>{proof.status === "processing" ? "Processing" : proof.status[0].toUpperCase() + proof.status.slice(1)}</span>
                      </td>
                      <td className="max-w-64 px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          proof.notification_status === "sent" ? "bg-blue-50 text-blue-700"
                            : proof.notification_status === "failed" ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                        }`}>
                          {proof.notification_status === "sent" ? "Email sent" : proof.notification_status === "failed" ? "Email failed" : "Not sent"}
                        </span>
                        {proof.notification_template_id && <p className="mt-1 truncate text-xs text-slate-600">{proof.notification_template_id === "payment-proof-rejection" ? "Rejection email" : "Payment confirmation"}</p>}
                        {proof.notification_error && <p className="mt-1 line-clamp-2 text-xs text-rose-700" title={proof.notification_error}>{proof.notification_error}</p>}
                        {proof.notification_attempted_at && <p className="mt-1 text-[10px] text-slate-400">{formatDate(proof.notification_attempted_at)}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" onClick={() => setSelectedImage(proof)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                          <Eye aria-hidden="true" className="h-4 w-4" /> View image
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {proof.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button type="button" disabled={Boolean(workingId)} onClick={() => void reviewProof(proof, "approved")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">
                              {workingId === proof.id ? <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : <Check aria-hidden="true" className="h-3.5 w-3.5" />} Approve
                            </button>
                            <button type="button" disabled={Boolean(workingId)} onClick={() => { setRejectingProof(proof); setRejectionReason("") }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">
                              <XCircle aria-hidden="true" className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="block text-right text-xs text-slate-400">{proof.reviewed_at ? formatDate(proof.reviewed_at) : "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedImage(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="proof-image-title" className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0"><h2 id="proof-image-title" className="truncate text-sm font-semibold text-slate-900">{selectedImage.student_name} · {selectedImage.student_code}</h2><p className="mt-1 text-xs text-slate-500">{selectedImage.course} · {formatDate(selectedImage.created_at)}</p></div>
              <button type="button" onClick={() => setSelectedImage(null)} aria-label="Close image preview" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><X aria-hidden="true" className="h-5 w-5" /></button>
            </div>
            <div className="flex min-h-48 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3 sm:p-6">
              {/* Proofs are private; this short-lived URL is issued only after admin authorization. */}
              <img src={selectedImage.imageUrl} alt={`Payment receipt submitted by ${selectedImage.student_name}`} className="max-h-[70vh] max-w-full object-contain" />
            </div>
          </section>
        </div>
      )}

      {rejectingProof && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !workingId) setRejectingProof(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="reject-proof-title" className="w-full max-w-lg rounded-2xl border border-white/80 bg-white p-6 shadow-2xl sm:p-7">
            <h2 id="reject-proof-title" className="text-lg font-semibold text-slate-950">Reject payment proof?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">We’ll email {rejectingProof.student_name} and explain that the receipt needs another look. Add a note or use the standard message.</p>
            <label htmlFor="proof-rejection-reason" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Note for the learner (optional)</label>
            <textarea id="proof-rejection-reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} maxLength={500} rows={4} placeholder="For example: The receipt image is too blurry to verify." className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50" />
            {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={Boolean(workingId)} onClick={() => setRejectingProof(null)} className="min-h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={Boolean(workingId)} onClick={() => void reviewProof(rejectingProof, "rejected", rejectionReason)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50">
                {workingId === rejectingProof.id && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />} Reject and email learner
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
