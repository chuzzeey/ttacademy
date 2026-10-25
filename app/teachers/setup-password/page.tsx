"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, LockKeyhole } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function TeacherPasswordSetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data, error: authError }) => {
      if (authError || !data.user) {
        router.replace("/teachers/login")
        return
      }
      const { data: teacher, error: teacherError } = await supabase
        .from("classroom_teachers")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle()
      if (teacherError || !teacher) {
        await supabase.auth.signOut()
        router.replace("/teachers/login")
        return
      }
      setChecking(false)
    })
  }, [router, supabase])

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (password.length < 12) {
      setError("Use at least 12 characters for your new password.")
      return
    }
    if (password !== confirmation) {
      setError("The passwords do not match.")
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    await supabase.auth.signOut()
    router.replace("/teachers/login")
  }

  if (checking) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f5] text-sm text-slate-500"><LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-800" />Checking teacher account…</main>

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f5] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-200/25 blur-3xl" />
      <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_22px_60px_-30px_rgba(6,78,59,.24)]">
        <header className="bg-gradient-to-br from-[#092e22] via-[#0f5134] to-[#0a382a] px-6 py-7 text-white sm:px-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08]"><LockKeyhole aria-hidden="true" className="h-5 w-5" /></div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">Secure access</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Set your password</h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50/75">Replace the one-time password with a private password before signing in.</p>
        </header>
        <div className="p-6 sm:p-7">
          {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{error}</p>}
          <form onSubmit={(event) => void savePassword(event)} className="space-y-4">
            <label className="block space-y-2 text-sm font-medium text-slate-700">New password<input type="password" minLength={12} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" /></label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">Confirm password<input type="password" minLength={12} autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" /></label>
            <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Save password</button>
          </form>
        </div>
      </section>
    </main>
  )
}
