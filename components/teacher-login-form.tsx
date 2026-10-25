"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole, MailCheck } from "lucide-react"
import { COURSE_CATALOG } from "@/lib/course-catalog"

export function TeacherLoginForm({ requestedCourse }: { requestedCourse?: string }) {
  const router = useRouter()
  const course = COURSE_CATALOG.find((item) => item.slug === requestedCourse)
  const [confirmed, setConfirmed] = useState(false)
  const [email, setEmail] = useState("")
  const [challengeId, setChallengeId] = useState("")
  const [maskedEmail, setMaskedEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success || !requestedCourse) return
    const timer = window.setTimeout(() => {
      router.replace(`/teachers/${requestedCourse}`)
      router.refresh()
    }, 900)
    return () => window.clearTimeout(timer)
  }, [requestedCourse, router, success])

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!requestedCourse) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/classroom/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginType: "teacher", courseSlug: requestedCourse, email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to send your sign-in code.")
      setChallengeId(result.challengeId)
      setMaskedEmail(result.maskedEmail)
      setCode("")
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
        body: JSON.stringify({ challengeId, code }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to verify your sign-in code.")
      if (result.role !== "teacher" || result.courseSlug !== requestedCourse) {
        throw new Error("This sign-in code is not for this classroom.")
      }
      setSuccess(true)
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify your sign-in code.")
    } finally {
      setLoading(false)
    }
  }

  if (!course || !requestedCourse) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4">
        <section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-xl">
          <h1 className="text-xl font-semibold text-slate-900">Choose your classroom</h1>
          <p className="mt-2 text-sm text-slate-500">Select your assigned class before signing in.</p>
          <Link href="/teachers" className="mt-5 inline-flex rounded-xl bg-[#008069] px-4 py-3 text-sm font-semibold text-white">Browse classes</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-35px_rgba(15,23,42,.28)]">
        <header className="bg-[#075e54] px-6 py-7 text-white">
          <Link href="/teachers" className="inline-flex items-center gap-2 text-xs text-white/75 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Teacher portal</Link>
          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><LockKeyhole aria-hidden="true" className="h-5 w-5" /></div>
          <h1 className="mt-4 text-xl font-semibold">Teacher sign in</h1>
          <p className="mt-1 text-sm text-white/75">{course.title} classroom</p>
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
            <h2 className="text-base font-semibold">You’re about to enter {course.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in with the exact email assigned to you by the academy administrator. We’ll email you a one-time code.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/teachers" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Not now</Link>
              <button type="button" onClick={() => setConfirmed(true)} className="min-h-11 flex-1 rounded-xl bg-[#008069] px-4 text-sm font-semibold text-white transition hover:bg-[#006d5c]">Continue</button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-7">
            {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{error}</p>}
            {!challengeId ? (
              <form onSubmit={(event) => void requestCode(event)} className="space-y-4">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Assigned teacher email
                  <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" />
                </label>
                <button disabled={loading} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008069] px-4 text-sm font-semibold text-white transition hover:bg-[#006d5c] disabled:opacity-60">
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                  {loading ? "Sending code…" : "Send sign-in code"}
                </button>
              </form>
            ) : (
              <form onSubmit={(event) => void verifyCode(event)} className="space-y-4">
                <p className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">A one-time code was sent to <strong>{maskedEmail}</strong>. It expires in 15 minutes.</p>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Six-digit email code
                  <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-center font-mono text-lg tracking-[0.4em] outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" />
                </label>
                <button disabled={loading} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008069] px-4 text-sm font-semibold text-white transition hover:bg-[#006d5c] disabled:opacity-60">
                  {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {loading ? "Verifying…" : "Verify and enter class"}
                </button>
                <button type="button" disabled={loading} onClick={() => { setChallengeId(""); setCode(""); setError("") }} className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800">Use a different email</button>
              </form>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
