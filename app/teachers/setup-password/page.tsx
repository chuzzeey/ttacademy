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

  if (checking) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Checking teacher account…</main>

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-emerald-50/40 to-white px-4 py-10">
      <section className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><LockKeyhole className="h-5 w-5" /></div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Set your password</h1>
        <p className="mt-1 text-sm text-slate-500">Replace the one-time password with a private password before signing in.</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-800">{error}</p>}
        <form onSubmit={(event) => void savePassword(event)} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-xs font-medium">New password<input type="password" minLength={12} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm" /></label>
          <label className="block space-y-1.5 text-xs font-medium">Confirm password<input type="password" minLength={12} autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm" /></label>
          <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Save password</button>
        </form>
      </section>
    </main>
  )
}
