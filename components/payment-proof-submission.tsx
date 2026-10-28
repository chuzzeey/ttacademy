"use client"

import { useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileImage, LoaderCircle, LockKeyhole, Upload, X } from "lucide-react"
import { COURSE_CATALOG } from "@/lib/course-catalog"

type Step = 0 | 1 | 2
type StudentCheck = { valid: boolean; course?: string; error?: string }

const maxFileSize = 15 * 1024 * 1024
const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]

export default function PaymentProofSubmission() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(0)
  const [direction, setDirection] = useState<"next" | "previous">("next")
  const [course, setCourse] = useState("")
  const [studentCode, setStudentCode] = useState("")
  const [proof, setProof] = useState<File | null>(null)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedCourseTitle = COURSE_CATALOG.find(({ title }) => title.toLowerCase() === course)?.title || course

  const close = () => {
    if (checking || submitting) return
    setOpen(false)
    window.setTimeout(() => {
      setStep(0)
      setDirection("next")
      setCourse("")
      setStudentCode("")
      setProof(null)
      setMessage("")
      setSuccess(false)
    }, 250)
  }

  const moveTo = (nextStep: Step, nextDirection: "next" | "previous") => {
    setDirection(nextDirection)
    setStep(nextStep)
    setMessage("")
  }

  const verifyStudent = async () => {
    setChecking(true)
    setMessage("")
    try {
      const response = await fetch("/api/payment-proofs/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, studentCode: studentCode.trim() }),
      })
      const result = await response.json() as StudentCheck
      if (!response.ok || !result.valid) {
        if (result.course) {
          setMessage(`This student ID belongs to ${result.course}, not ${course}. Please go back and choose the matching course.`)
        } else {
          setMessage(result.error || "We couldn't verify this student ID. Check it and try again.")
        }
        return
      }
      moveTo(2, "next")
    } catch (error) {
      console.error("Payment proof student verification failed:", error)
      setMessage("We couldn't check your student ID right now. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  const submitProof = async () => {
    if (!proof) return
    setSubmitting(true)
    setMessage("")
    try {
      const payload = new FormData()
      payload.set("course", course)
      payload.set("studentCode", studentCode.trim())
      payload.set("proof", proof)
      const response = await fetch("/api/payment-proofs", { method: "POST", body: payload })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Unable to submit your payment proof.")
      setSuccess(true)
    } catch (error) {
      console.error("Payment proof submission failed:", error)
      setMessage(error instanceof Error ? error.message : "Unable to submit your payment proof. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="payment-proof" className="scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-[0_24px_70px_-45px_rgba(30,64,175,.4)] sm:p-9 lg:p-11">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">Already made a payment?</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Send us your payment proof</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Choose the course you paid for, verify your student ID, then upload one clear image of your receipt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(29,78,216,.75)] transition hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 motion-reduce:transform-none"
          >
            <Upload aria-hidden="true" className="h-[18px] w-[18px]" />
            Submit payment proof
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close()
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="proof-dialog-title" className="w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_100px_-24px_rgba(15,23,42,.55)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">Payment verification</p>
                <h2 id="proof-dialog-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Submit your payment proof</h2>
                {!success && <p className="mt-2 text-xs text-slate-500">Step {step + 1} of 3</p>}
              </div>
              <button type="button" onClick={close} disabled={checking || submitting} aria-label="Close payment proof form" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="px-6 py-10 text-center sm:px-10">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700"><CheckCircle2 aria-hidden="true" className="h-9 w-9" /></span>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">Proof received</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">Thanks! Our team will review your payment and email you with an update.</p>
                <button type="button" onClick={close} className="mt-7 min-h-11 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white transition hover:bg-blue-800">Done</button>
              </div>
            ) : (
              <>
                <div key={step} className={`min-h-[300px] px-5 py-6 sm:px-7 sm:py-8 ${direction === "next" ? "payment-proof-step-next" : "payment-proof-step-previous"}`}>
                  {step === 0 && (
                    <div>
                      <label htmlFor="proof-course" className="block text-sm font-semibold text-slate-900">Which course did you pay for?</label>
                      <p className="mt-1 text-sm text-slate-500">Select the course linked to your student ID.</p>
                      <select id="proof-course" value={course} onChange={(event) => setCourse(event.target.value)} className="mt-5 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                        <option value="">Select your course</option>
                        {COURSE_CATALOG.map(({ title }) => <option key={title} value={title.toLowerCase()}>{title}</option>)}
                      </select>
                    </div>
                  )}
                  {step === 1 && (
                    <div>
                      <label htmlFor="proof-student-id" className="block text-sm font-semibold text-slate-900">Enter your student ID</label>
                      <p className="mt-1 text-sm text-slate-500">We’ll check that it belongs to {selectedCourseTitle} before accepting your proof.</p>
                      <input id="proof-student-id" autoComplete="off" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} onKeyDown={(event) => {
                        if (event.key === "Enter" && studentCode.trim() && !checking) void verifyStudent()
                      }} placeholder="For example, TTA-12345A" className="mt-5 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase text-slate-900 outline-none placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole aria-hidden="true" className="h-4 w-4" />Your ID is only used to locate your enrollment.</p>
                    </div>
                  )}
                  {step === 2 && (
                    <div>
                      <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-700"><Check aria-hidden="true" className="h-5 w-5" /></span>
                        <div className="min-w-0"><p className="text-xs font-semibold text-blue-900">Student ID verified</p><p className="mt-0.5 truncate text-xs text-slate-600">{studentCode.trim()} · {selectedCourseTitle}</p></div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={(event) => {
                        const selected = event.target.files?.[0] ?? null
                        setMessage("")
                        if (!selected) return setProof(null)
                        if (!acceptedTypes.includes(selected.type)) {
                          setProof(null)
                          setMessage("Choose a JPG, PNG, WebP, AVIF, or GIF image.")
                          event.target.value = ""
                          return
                        }
                        if (selected.size > maxFileSize) {
                          setProof(null)
                          setMessage("This image is larger than 15 MB. Choose a smaller file.")
                          event.target.value = ""
                          return
                        }
                        setProof(selected)
                      }} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-5 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">{proof ? <FileImage aria-hidden="true" className="h-6 w-6" /> : <Upload aria-hidden="true" className="h-6 w-6" />}</span>
                        <span className="mt-3 max-w-full truncate text-sm font-semibold text-slate-900">{proof?.name ?? "Choose your payment receipt"}</span>
                        <span className="mt-1 text-xs text-slate-500">{proof ? `${(proof.size / 1024 / 1024).toFixed(2)} MB · Click to change` : "One image · JPG, PNG, WebP, AVIF or GIF · Up to 15 MB"}</span>
                      </button>
                    </div>
                  )}
                  {message && <p role="alert" className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700">{message}</p>}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <button type="button" onClick={() => moveTo((step - 1) as Step, "previous")} disabled={step === 0 || checking || submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:invisible">
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
                  </button>
                  {step < 1 ? (
                    <button type="button" disabled={!course} onClick={() => moveTo(1, "next")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                      Continue <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  ) : step === 1 ? (
                    <button type="button" disabled={!studentCode.trim() || checking} onClick={() => void verifyStudent()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                      {checking ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> Checking student ID…</> : <>Verify and continue <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
                    </button>
                  ) : (
                    <button type="button" disabled={!proof || submitting} onClick={() => void submitProof()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> Submitting proof…</> : <><Upload aria-hidden="true" className="h-4 w-4" /> Submit proof</>}
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
