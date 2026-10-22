"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react"
import { COURSE_CATALOG } from "@/lib/course-catalog"
import { createClient } from "@/lib/supabase/client"

export function TeacherLoginForm({ requestedCourse }: { requestedCourse?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError || !data.user) throw new Error("Email or password is incorrect.")

      const { data: teacher, error: teacherError } = await supabase
        .from("classroom_teachers")
        .select("course_slug,status")
        .eq("user_id", data.user.id)
        .maybeSingle()
      if (teacherError) throw new Error("Unable to verify teacher access. Please try again.")
      if (!teacher) throw new Error("This account is not assigned to a classroom teacher.")
      if (requestedCourse && teacher.course_slug !== requestedCourse) {
        throw new Error("This account is assigned to a different course.")
      }

      if (data.user.user_metadata?.must_change_password === true) {
        router.push("/teachers/setup-password")
        return
      }
      if (teacher.status === "pending") throw new Error("Your teacher access is awaiting administrator approval.")
      if (teacher.status === "restricted") throw new Error("This teacher account has been restricted. Contact the academy administrator.")

      const { data: role, error: accessError } = await supabase.rpc("classroom_user_role", {
        p_course_slug: teacher.course_slug,
      })
      if (accessError || role !== "teacher") throw new Error("This class is locked or your access is not active.")
      router.push(`/teachers/${teacher.course_slug}`)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in.")
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-emerald-50/40 to-white px-4 py-10">
      <section className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_80px_-35px_rgba(15,23,42,.24)] backdrop-blur-xl sm:p-8">
        <Link href="/teachers" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Teacher portal</Link>
        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><LockKeyhole className="h-5 w-5" /></div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Teacher sign in</h1>
        <p className="mt-1 text-sm text-slate-500">{requestedCourse ? `Sign in to your ${COURSE_CATALOG.find((course) => course.slug === requestedCourse)?.title ?? "class"} classroom.` : "Use the sign-in credentials provided by the administrator."}</p>
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800">{error}</p>}
        <form onSubmit={(event) => void signIn(event)} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-xs font-medium text-slate-700">Email<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /></label>
          <label className="block space-y-1.5 text-xs font-medium text-slate-700">Password<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /></label>
          <button disabled={loading} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Sign in</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">Teacher accounts are created and approved by the administrator. Password reset emails are not configured yet.</p>
      </section>
    </main>
  )
}
