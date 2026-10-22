"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight, BookOpenCheck, Check, Copy, DoorOpen, LockKeyhole,
  LoaderCircle, ShieldAlert, UnlockKeyhole, Users, X,
} from "lucide-react"
import { PageHeader } from "../components/dashboard/page-header"

type Course = { slug: string; title: string; is_active: boolean }
type Teacher = {
  id: string
  course_slug: string
  email: string
  display_name: string
  status: "pending" | "approved" | "restricted"
  created_at: string
}
type Student = {
  student_id: string
  course_slug: string
  status: "pending" | "approved" | "restricted"
  student: {
    id: string
    name: string
    email: string
    payment_status: string
    restricted: boolean
    created_at: string
  } | null
}
type ClassroomData = {
  courses: Course[]
  rooms: { course_slug: string; is_locked: boolean }[]
  teachers: Teacher[]
  students: Student[]
}

function StatusBadge({ status }: { status: string }) {
  const colors = status === "approved"
    ? "bg-emerald-50 text-emerald-700"
    : status === "restricted"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-800"
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${colors}`}>{status}</span>
}

export default function ClassroomManagementPage() {
  const router = useRouter()
  const [data, setData] = useState<ClassroomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyKey, setBusyKey] = useState("")
  const [showEnterModal, setShowEnterModal] = useState(false)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [teacherCourse, setTeacherCourse] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [credential, setCredential] = useState<{ email: string; password: string; course: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/classrooms", { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to load classroom management.")
      setData(result as ClassroomData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load classroom management.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const courseTitle = useMemo(
    () => new Map((data?.courses ?? []).map((course) => [course.slug, course.title])),
    [data],
  )
  const roomLocked = (slug: string) => data?.rooms.find((room) => room.course_slug === slug)?.is_locked ?? false

  const postAction = async (body: Record<string, unknown>, key: string) => {
    setBusyKey(key)
    setError("")
    setNotice("")
    try {
      const response = await fetch("/api/admin/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to update classroom access.")
      if (result.temporaryPassword && result.teacher) {
        setCredential({
          email: result.teacher.email,
          password: result.temporaryPassword,
          course: courseTitle.get(result.teacher.courseSlug) ?? result.teacher.courseSlug,
        })
      } else {
        setNotice(result.message || "Classroom settings updated.")
        await refresh()
      }
      return true
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update classroom access.")
      return false
    } finally {
      setBusyKey("")
    }
  }

  const createTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const created = await postAction({
      action: "create-teacher",
      courseSlug: teacherCourse,
      displayName: teacherName,
    }, "create-teacher")
    if (created) {
      setShowTeacherModal(false)
      setTeacherName("")
      setTeacherCourse("")
      await refresh()
    }
  }

  const copyCredentials = async () => {
    if (!credential) return
    try {
      await navigator.clipboard.writeText(
        `Class: ${credential.course}\nEmail: ${credential.email}\nTemporary password: ${credential.password}`,
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("Could not copy credentials. Copy them manually before closing this dialog.")
    }
  }

  const teachers = data?.teachers ?? []
  const students = data?.students ?? []
  const pendingTeachers = teachers.filter(({ status }) => status === "pending").length
  const pendingStudents = students.filter(({ status }) => status === "pending").length

  return (
    <main className="space-y-6 pb-10">
      <PageHeader title="Classroom Management" description="Enter classes, manage teacher access, and approve enrolled students." />

      {(error || notice) && (
        <div role={error ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
          error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}>
          <p>{error || notice}</p>
          <button type="button" aria-label="Dismiss message" onClick={() => { setError(""); setNotice("") }}><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Classroom actions">
        <button type="button" onClick={() => setShowEnterModal(true)} className="dashboard-card flex min-h-28 items-center gap-4 rounded-2xl p-5 text-left transition hover:-translate-y-0.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><DoorOpen className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">Enter a class</span><span className="mt-1 block text-xs text-muted-foreground">Open the course group chat</span></span>
        </button>
        <button type="button" onClick={() => setShowTeacherModal(true)} className="dashboard-card flex min-h-28 items-center gap-4 rounded-2xl p-5 text-left transition hover:-translate-y-0.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><BookOpenCheck className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">Teacher access</span><span className="mt-1 block text-xs text-muted-foreground">{pendingTeachers} awaiting approval</span></span>
        </button>
        <div className="dashboard-card flex min-h-28 items-center gap-4 rounded-2xl p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><Users className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">Student access</span><span className="mt-1 block text-xs text-muted-foreground">{pendingStudents} awaiting approval</span></span>
        </div>
      </section>

      <section className="dashboard-card rounded-2xl p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Classes</h2>
          <p className="mt-1 text-xs text-muted-foreground">Available classes match the courses offered on the registration form.</p>
        </div>
        {loading && !data ? (
          <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading classes…</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(data?.courses ?? []).map((course) => {
              const teacher = teachers.find((item) => item.course_slug === course.slug && item.status !== "restricted")
              const classStudents = students.filter((item) => item.course_slug === course.slug)
              const locked = roomLocked(course.slug)
              return (
                <article key={course.slug} className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{course.title}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{teacher ? `Teacher: ${teacher.display_name}` : "Teacher not assigned"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{classStudents.length} registered students</p>
                    </div>
                    <button
                      type="button"
                      disabled={busyKey === `lock-${course.slug}`}
                      onClick={() => void postAction({ action: "set-lock", courseSlug: course.slug, locked: !locked }, `lock-${course.slug}`)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted"
                      aria-label={`${locked ? "Unlock" : "Lock"} ${course.title} class`}
                    >
                      {locked ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                      {locked ? "Locked" : "Open"}
                    </button>
                  </div>
                  <button type="button" onClick={() => router.push(`/dashboard/classrooms/${course.slug}`)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800">
                    Enter class <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="dashboard-card rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div><h2 className="text-sm font-semibold">Teacher approvals</h2><p className="mt-1 text-xs text-muted-foreground">Each course has one teacher account. Credentials are generated individually.</p></div>
          <button type="button" onClick={() => setShowTeacherModal(true)} className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Add teacher</button>
        </div>
        <div className="divide-y divide-border/60">
          {teachers.length === 0 ? <p className="py-6 text-center text-xs text-muted-foreground">No teachers assigned yet.</p> : teachers.map((teacher) => (
            <div key={teacher.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{teacher.display_name}</p><p className="truncate text-xs text-muted-foreground">{courseTitle.get(teacher.course_slug) ?? teacher.course_slug} · {teacher.email}</p></div>
              <div className="flex items-center gap-2"><StatusBadge status={teacher.status} />
                {teacher.status === "pending" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "teacher", id: teacher.id, status: "approved" }, `teacher-${teacher.id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">Approve</button>}
                {teacher.status === "restricted" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "teacher", id: teacher.id, status: "pending" }, `teacher-${teacher.id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50">Restore</button>}
                {teacher.status !== "restricted" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "teacher", id: teacher.id, status: "restricted" }, `teacher-${teacher.id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Restrict</button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-card rounded-2xl p-4 sm:p-6">
        <div className="mb-4"><h2 className="text-sm font-semibold">Student approvals</h2><p className="mt-1 text-xs text-muted-foreground">Students are grouped by their registered course and payment status.</p></div>
        <div className="divide-y divide-border/60">
          {students.length === 0 ? <p className="py-6 text-center text-xs text-muted-foreground">No student classroom records yet.</p> : students.map((entry) => (
            <div key={entry.student_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{entry.student?.name || "Learner"}</p><p className="truncate text-xs text-muted-foreground">{courseTitle.get(entry.course_slug) ?? entry.course_slug} · {entry.student?.email ?? "No email"} · {entry.student?.payment_status ?? "Payment not recorded"}</p></div>
              <div className="flex items-center gap-2"><StatusBadge status={entry.student?.restricted ? "restricted" : entry.status} />
                {entry.status !== "approved" && !entry.student?.restricted && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "student", id: entry.student_id, status: "approved" }, `student-${entry.student_id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">Approve</button>}
                {(entry.status === "restricted" || entry.student?.restricted) && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "restore-student", id: entry.student_id }, `student-${entry.student_id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50">Restore</button>}
                {entry.status !== "restricted" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "student", id: entry.student_id, status: "restricted" }, `student-${entry.student_id}`)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Restrict</button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showEnterModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowEnterModal(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="enter-class-title" className="w-full max-w-lg rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between"><div><h2 id="enter-class-title" className="text-base font-semibold">Choose a class</h2><p className="mt-1 text-xs text-muted-foreground">As admin, you can always enter. Locking a class only blocks teachers and students.</p></div><button type="button" onClick={() => setShowEnterModal(false)} aria-label="Close class selection"><X className="h-4 w-4" /></button></div>
            <div className="mt-4 grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
              {(data?.courses ?? []).map((course) => <button key={course.slug} type="button" onClick={() => router.push(`/dashboard/classrooms/${course.slug}`)} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-3 text-left text-sm font-medium hover:bg-muted/50">{course.title}<ArrowRight className="h-4 w-4 text-muted-foreground" /></button>)}
            </div>
          </section>
        </div>
      )}

      {showTeacherModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="add-teacher-title" className="w-full max-w-md rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between"><div><h2 id="add-teacher-title" className="text-base font-semibold">Assign a teacher</h2><p className="mt-1 text-xs text-muted-foreground">A unique account will be created for the selected course.</p></div><button type="button" onClick={() => setShowTeacherModal(false)} aria-label="Close teacher form"><X className="h-4 w-4" /></button></div>
            <form onSubmit={(event) => void createTeacher(event)} className="space-y-4">
              <label className="block space-y-1.5 text-xs font-medium">Teacher display name<input required maxLength={80} value={teacherName} onChange={(event) => setTeacherName(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /></label>
              <label className="block space-y-1.5 text-xs font-medium">Course<select required value={teacherCourse} onChange={(event) => setTeacherCourse(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="">Select a course</option>{(data?.courses ?? []).filter((course) => !teachers.some((teacher) => teacher.course_slug === course.slug && teacher.status !== "restricted")).map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}</select></label>
              <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> No email is sent. The temporary password is displayed once after creation; share it directly and securely with the teacher.</p>
              <button disabled={busyKey === "create-teacher"} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{busyKey === "create-teacher" && <LoaderCircle className="h-4 w-4 animate-spin" />}Create account for approval</button>
            </form>
          </section>
        </div>
      )}

      {credential && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="teacher-credentials-title" className="w-full max-w-md rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Check className="h-6 w-6" /></div>
            <h2 id="teacher-credentials-title" className="mt-4 text-center text-base font-semibold">Teacher account created</h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">{credential.course} · Pending approval</p>
            <dl className="mt-5 space-y-3 rounded-xl bg-muted/40 p-4 text-sm"><div><dt className="text-xs text-muted-foreground">Login email</dt><dd className="mt-1 break-all font-medium">{credential.email}</dd></div><div><dt className="text-xs text-muted-foreground">One-time password</dt><dd className="mt-1 break-all font-mono font-medium">{credential.password}</dd></div></dl>
            <p className="mt-3 text-xs leading-5 text-amber-800">Copy this now. It will not be available after you close this window. The teacher must set a new password before entering class.</p>
            <button type="button" onClick={() => void copyCredentials()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy credentials"}</button>
            <button type="button" onClick={() => setCredential(null)} className="mt-2 w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Done</button>
          </section>
        </div>
      )}
    </main>
  )
}
