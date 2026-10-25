"use client"

import { FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, GraduationCap, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { COURSE_CATALOG } from "@/lib/course-catalog"
import { OtpCodeInput } from "@/components/otp-code-input"

export default function StudentClassroomLoginPage() {
  const params = useParams<{ course: string }>()
  const router = useRouter()
  const courseSlug = params.course
  const course = COURSE_CATALOG.find((item) => item.slug === courseSlug)
  const [confirmed, setConfirmed] = useState(false)
  const [studentCode, setStudentCode] = useState("")
  const [challengeId, setChallengeId] = useState("")
  const [maskedEmail, setMaskedEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!course) router.replace("/classroom")
  }, [course, router])

  useEffect(() => {
    if (!success || !course) return
    const timer = window.setTimeout(() => {
      router.replace(`/classroom/${course.slug}/dashboard`)
      router.refresh()
    }, 900)
    return () => window.clearTimeout(timer)
  }, [course, router, success])

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/classroom/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginType: "student", courseSlug, studentCode }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to send your sign-in code.")
      setChallengeId(result.challengeId)
      setMaskedEmail(result.maskedEmail)
      setOtp("")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send your sign-in code.")
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/classroom/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code: otp }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to verify your sign-in code.")
      if (result.role !== "student" || result.courseSlug !== courseSlug) {
        throw new Error("This sign-in code is not for this classroom.")
      }
      setSuccess(true)
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify your sign-in code.")
    } finally {
      setLoading(false)
    }
  }

  if (!course) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5]"><LoaderCircle className="h-6 w-6 animate-spin text-emerald-700" /></main>
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
      <Image src={course.image} alt="" fill priority sizes="100vw" className="pointer-events-none absolute inset-0 -z-10 scale-110 object-cover opacity-55 blur-md" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/70 via-emerald-950/45 to-slate-950/75" />
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white/[0.96] shadow-[0_30px_100px_-30px_rgba(2,12,27,.62)] backdrop-blur-2xl">
        <header className="bg-[#075e54] px-6 py-7 text-white">
          <Link href="/classroom" className="inline-flex items-center gap-2 text-xs text-white/75 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> All classrooms</Link>
          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><GraduationCap aria-hidden="true" className="h-6 w-6" /></div>
          <h1 className="mt-4 text-xl font-semibold">Welcome to your classroom</h1>
          <p className="mt-1 text-sm text-white/75">{course.title} group</p>
        </header>

        {success ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="mt-4 text-lg font-semibold">Welcome to class</h2>
            <p className="mt-1 text-sm text-slate-500">Opening your classroom…</p>
            <LoaderCircle className="mx-auto mt-5 h-5 w-5 animate-spin text-emerald-700" />
          </div>
        ) : !confirmed ? (
          <div className="px-6 py-7">
            <h2 className="text-base font-semibold">You’re about to join {course.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Continue with your student ID. We’ll send a one-time code to the email address registered to that ID.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/classroom" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Not now</Link>
              <button type="button" onClick={() => setConfirmed(true)} className="min-h-11 flex-1 rounded-xl bg-[#008069] px-4 text-sm font-semibold text-white transition hover:bg-[#006d5c]">Continue</button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-7">
            {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{error}</p>}
            {!challengeId ? (
              <form onSubmit={(event) => void requestCode(event)} className="space-y-4">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Student ID
                  <input
                    required
                    autoComplete="username"
                    value={studentCode}
                    onChange={(event) => setStudentCode(event.target.value.toUpperCase())}
                    placeholder="TTA-12345A"
                    className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                  />
                </label>
                <p className="text-xs leading-5 text-slate-500">Your ID only works for its registered class. Your access, payment, and class status will be checked before sending a code.</p>
                <button disabled={loading} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008069] px-4 text-sm font-semibold text-white transition hover:bg-[#006d5c] disabled:opacity-60">
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                  {loading ? "Sending code…" : "Send sign-in code"}
                </button>
              </form>
            ) : (
              <form onSubmit={(event) => void verifyCode(event)} className="space-y-4">
                <div className="flex gap-3 rounded-xl bg-emerald-50 p-3 text-emerald-900">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-xs leading-5">We sent a one-time code to <strong>{maskedEmail}</strong>. It expires in 15 minutes. If you don’t see it, check your spam or junk folder.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Enter your six-digit code</p>
                  <OtpCodeInput value={otp} onChange={setOtp} disabled={loading} />
                </div>
                <button disabled={loading || otp.length !== 6} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008069] px-4 text-sm font-semibold text-white transition hover:bg-[#006d5c] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {loading ? "Verifying…" : "Verify and enter class"}
                </button>
                <button type="button" disabled={loading} onClick={() => { setChallengeId(""); setOtp(""); setError("") }} className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800">Use a different student ID</button>
              </form>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
