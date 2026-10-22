'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, Eye, EyeOff, Key, ShieldCheck } from 'lucide-react'
import { ADMIN_EMAIL } from '@/lib/supabase/admin-access'
import { BRAND_LOGO_URL } from '@/lib/brand'

type SignInPhase = 'credentials' | 'access' | 'workspace'

function waitUntil(timestamp: number) {
  const delay = timestamp - Date.now()
  return delay > 0 ? new Promise<void>((resolve) => window.setTimeout(resolve, delay)) : Promise.resolve()
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signInSuccess, setSignInSuccess] = useState(false)
  const [signInPhase, setSignInPhase] = useState<SignInPhase>('credentials')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router, supabase])

  useEffect(() => {
    // Check for error parameter in URL
    const url = new URL(window.location.href)
    const errorParam = url.searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('Unauthorized: Only the admin can access this dashboard')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const startedAt = Date.now()
    setLoading(true)
    setSignInPhase('credentials')
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error('Unable to verify the signed-in account')

      await waitUntil(startedAt + 1800)
      setSignInPhase('access')
      let isAdmin = data.user.email?.toLowerCase() === ADMIN_EMAIL

      if (!isAdmin) {
        const { data: adminProfile, error: profileError } = await supabase
          .from('admin_profiles')
          .select('user_id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Admin profile lookup failed:', profileError)
          await supabase.auth.signOut()
          throw new Error('Unable to verify admin access. Please try again.')
        }

        isAdmin = Boolean(adminProfile)
      }

      if (!isAdmin) {
        await supabase.auth.signOut()
        setError('Unauthorized: This account does not have admin access')
        setLoading(false)
        return
      }

      if (data.session) {
        await waitUntil(startedAt + 5000)
        setSignInPhase('workspace')
        await waitUntil(startedAt + 7600)
        setLoading(false)
        setSignInSuccess(true)
        window.setTimeout(() => {
          router.replace('/dashboard')
          router.refresh()
        }, 700)
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[#eaf0eb] font-sans text-[#19231c]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#c1e1c9]/70 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-[#b7c8ec]/55 blur-[110px]"
      />
      <img
        aria-hidden="true"
        src={BRAND_LOGO_URL}
        alt=""
        className="pointer-events-none absolute bottom-[4%] right-[-9rem] z-0 w-[26rem] rotate-[-10deg] opacity-[0.07] blur-[0.5px] saturate-50 sm:right-[-5rem] lg:right-[3%] lg:top-[8%] lg:bottom-auto lg:w-[30rem]"
      />
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1440px] items-center justify-center p-3 sm:p-6 lg:p-10">
        <div className="grid min-h-[min(760px,calc(100svh-5rem))] w-full max-w-[1180px] overflow-hidden rounded-[28px] border border-white/70 bg-white/35 shadow-[0_32px_100px_-45px_rgba(30,55,37,0.35)] backdrop-blur-2xl lg:grid-cols-[1.03fr_0.97fr]">
          <aside className="relative hidden min-h-[660px] flex-col justify-between overflow-hidden bg-[#17251c] p-9 text-white sm:p-11 lg:flex xl:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-[#74c891]/20 blur-[80px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#a9c4f0]/10 blur-[85px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[-5rem] top-[21%] h-[25rem] w-[25rem] rounded-full border border-white/[0.08]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[-1rem] top-[29%] h-[17rem] w-[17rem] rounded-full border border-white/[0.08]"
            />

            <Link
              href="/"
              className="relative z-10 inline-flex w-fit items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#b9ebc5]"
            >
              <span className="flex h-[4.5rem] w-24 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3 shadow-inner shadow-white/10 backdrop-blur-md xl:h-20 xl:w-[6.5rem]">
                <img
                  src={BRAND_LOGO_URL}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="max-w-[14rem] text-base font-semibold leading-5 tracking-tight xl:text-lg">
                Tech Trailblazer Academy
              </span>
            </Link>

            <div className="relative z-10 max-w-md pb-4">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a8e7b5] shadow-[0_0_10px_2px_rgba(168,231,181,0.55)]" />
                ACADEMY ADMINISTRATION
              </div>
              <h1
                aria-label="Run your academy from one workspace."
                className="max-w-none text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.055em] xl:text-[3rem]"
              >
                Run your academy
                <br />
                <span className="bg-gradient-to-r from-[#c4f3cb] via-[#a9dfc5] to-[#c3d8ff] bg-clip-text text-transparent">
                  from one workspace.
                </span>
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
                Review student registrations, update payment statuses, manage
                student access, and follow enrollment activity. Use the email
                tools to manage learner communications and the analytics
                workspace to review registration and payment summaries.
              </p>
            </div>

            <p className="relative z-10 text-[11px] text-white/45">
              © {new Date().getFullYear()} Tech Trailblazer Academy
            </p>
          </aside>

          <section className="relative flex min-h-[min(760px,calc(100svh-5rem))] flex-col justify-between overflow-hidden rounded-[24px] bg-white/55 p-5 shadow-[0_16px_40px_-28px_rgba(30,55,37,0.45)] backdrop-blur-2xl sm:rounded-[28px] sm:p-8 lg:min-h-0 lg:overflow-visible lg:rounded-none lg:bg-white/35 lg:p-10 lg:shadow-none xl:p-14">
            <header className="relative -mx-5 -mt-5 mb-2 overflow-hidden rounded-b-none border-b border-white/10 bg-[#17251c] px-5 pb-5 pt-3 text-white sm:-mx-8 sm:-mt-8 sm:px-8 sm:pb-6 sm:pt-5 lg:mx-0 lg:mt-0 lg:mb-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-[#19231c]">
              <img
                aria-hidden="true"
                src={BRAND_LOGO_URL}
                alt=""
                className="pointer-events-none absolute -right-8 top-8 w-44 rotate-[-12deg] opacity-[0.1] mix-blend-screen sm:-right-4 sm:top-4 sm:w-52 lg:hidden"
              />
              <div className="relative z-10 flex items-center justify-between gap-3 lg:justify-end">
              <Link
                href="/"
                aria-label="Tech Trailblazer Academy home"
                className="inline-flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#b9ebc5] lg:hidden"
              >
                <img
                  src={BRAND_LOGO_URL}
                  alt=""
                  className="h-12 w-14 shrink-0 rounded-lg border border-white/20 bg-white/10 p-1 object-contain sm:h-14 sm:w-16 md:h-16 md:w-[4.5rem]"
                />
                <span className="hidden truncate text-sm font-semibold leading-5 tracking-tight sm:inline sm:text-base">
                  Tech Trailblazer Academy
                </span>
              </Link>
              <span className="hidden items-center gap-1.5 rounded-full border border-[#dce6dd] bg-white/65 px-3 py-1.5 text-[11px] font-medium text-[#59665c] shadow-sm lg:inline-flex">
                <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-[#28734b]" />
                Admin access
              </span>
              </div>
              <div className="relative z-10 mt-5 max-w-lg lg:hidden">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a8e7b5]">
                  Academy administration
                </p>
                <h1
                  aria-label="Run your academy from one workspace."
                  className="hidden text-2xl font-semibold leading-[1.05] tracking-[-0.045em] sm:block sm:text-3xl"
                >
                  Run your academy
                  <br />
                  <span className="bg-gradient-to-r from-[#c4f3cb] via-[#a9dfc5] to-[#c3d8ff] bg-clip-text text-transparent">
                    from one workspace.
                  </span>
                </h1>
                <p className="mt-3 hidden max-w-md text-[13px] leading-5 text-white/70 sm:block sm:text-sm sm:leading-6">
                  Review registrations and payment statuses, manage student
                  access and learner communications, and follow enrollment
                  activity.
                </p>
              </div>
            </header>

            <div className="flex flex-1 items-start justify-center py-5 sm:items-center sm:py-12 lg:py-8">
              <div className="w-full max-w-[360px]">
                <div className="mb-7">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#43835c]">
                    Welcome back
                  </p>
                  <h2 className="text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-[#202820]">
                    Sign in
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#707a72]">
                    Continue to your admin workspace.
                  </p>
                </div>

                <form
                  id="admin-login-form"
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="rounded-xl border border-red-200/80 bg-red-50/85 px-3.5 py-3 text-[13px] leading-5 text-red-700 shadow-sm"
                    >
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-[#3b463d]"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="h-11 w-full rounded-none border-0 border-b border-[#b9c9bd] bg-transparent px-1 text-sm text-[#20231f] shadow-none outline-none transition placeholder:text-[#9aa49b] hover:border-[#7eaa8a] focus:border-b-2 focus:border-[#43835c] focus:bg-white/20 focus:ring-0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-[#3b463d]"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="h-11 w-full rounded-none border-0 border-b border-[#b9c9bd] bg-transparent px-1 pr-12 text-sm text-[#20231f] shadow-none outline-none transition placeholder:text-[#9aa49b] hover:border-[#7eaa8a] focus:border-b-2 focus:border-[#43835c] focus:bg-white/20 focus:ring-0"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#778279] transition hover:bg-[#edf3ee] hover:text-[#34453a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28734b]"
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <Eye aria-hidden="true" className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1d7048] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(29,112,72,0.8)] transition hover:bg-[#185f3d] hover:shadow-[0_10px_22px_-10px_rgba(29,112,72,0.75)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#28734b]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Access portal
                        <Key aria-hidden="true" className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/80 bg-white/45 px-3.5 py-3 shadow-sm">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#43835c]"
                  />
                  <p className="text-[11px] leading-[1.4rem] text-[#6d786f]">
                    Secure access for approved academy administrators.
                  </p>
                </div>
              </div>
            </div>

            <footer className="flex items-center justify-between border-t border-[#dbe4dc]/80 pt-3 text-[10px] text-[#818b82] lg:hidden">
              <span>© {new Date().getFullYear()} Tech Trailblazer Academy</span>
              <span>Administrator portal</span>
            </footer>
            <div className="hidden border-t border-[#dbe4dc]/70 pt-3 text-[10px] text-[#89928a] lg:block">
              Authorized personnel only
            </div>
          </section>
        </div>
      </div>
      {(loading || signInSuccess) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14251b]/45 p-4 backdrop-blur-md" role="status" aria-live="polite">
          <section className="w-full max-w-[26rem] overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-[0_30px_90px_-30px_rgba(15,40,25,.5)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">
            <div className="relative overflow-hidden bg-[#17251c] px-7 pb-7 pt-8 text-center text-white">
              <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-10 h-48 w-48 rounded-full bg-blue-300/10 blur-3xl" />
              <div className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-[0_0_45px_rgba(100,220,140,.12)] ${signInSuccess ? "" : "motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]"}`}>
                <img src={BRAND_LOGO_URL} alt="" className="h-full w-full object-contain" />
                {signInSuccess && (
                  <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#17251c] bg-emerald-500 text-white shadow-md">
                    <Check className="h-5 w-5 animate-in zoom-in duration-300" strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="relative mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Tech Trailblazer Academy</p>
              <h2 className="relative mt-2 text-xl font-semibold tracking-tight">
                {signInSuccess ? "Sign-in successful" : "Secure sign in"}
              </h2>
              <p className="relative mt-1 text-sm text-white/65">
                {signInSuccess ? "Welcome to your admin workspace." : "Please hold while we prepare your workspace."}
              </p>
            </div>
            {signInSuccess ? (
              <div className="px-7 py-5 text-center text-xs font-medium text-emerald-800">Everything is ready. Opening your dashboard…</div>
            ) : (
              <div className="space-y-5 px-6 py-6 sm:px-7">
                <div className="h-1.5 overflow-hidden rounded-full bg-emerald-50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-[width] duration-700 ease-out ${
                      signInPhase === "credentials" ? "w-1/4" : signInPhase === "access" ? "w-2/3" : "w-full"
                    }`}
                  />
                </div>
                <ol className="space-y-4">
                  {[
                    { id: "credentials" as const, title: "Verifying your credentials", description: "Securely establishing your admin session." },
                    { id: "access" as const, title: "Checking admin access", description: "Confirming this account can access the workspace." },
                    { id: "workspace" as const, title: "Preparing your workspace", description: "Loading your academy administration tools." },
                  ].map((step, index) => {
                    const phases: SignInPhase[] = ["credentials", "access", "workspace"]
                    const currentIndex = phases.indexOf(signInPhase)
                    const isComplete = index < currentIndex
                    const isCurrent = index === currentIndex
                    return (
                      <li key={step.id} className={`flex items-start gap-3 transition-opacity duration-300 ${isComplete || isCurrent ? "opacity-100" : "opacity-45"}`}>
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          isComplete ? "bg-emerald-100 text-emerald-800" : isCurrent ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                          {isComplete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : isCurrent ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                          ) : <span className="text-[11px] font-semibold">{index + 1}</span>}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-800">{step.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.description}</span>
                        </span>
                      </li>
                    )
                  })}
                </ol>
                <p className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">Keep this window open while we securely verify your account.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh items-center justify-center bg-[#f5f7f5]">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#28734b]/20 border-t-[#28734b]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}