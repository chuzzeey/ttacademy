"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, Check, DoorOpen,
  GraduationCap, LockKeyhole, LoaderCircle, Plus, ShieldAlert,
  UnlockKeyhole, Users, X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  rooms: { course_slug: string; is_locked: boolean; teacher_email: string | null; teacher_display_name: string | null }[]
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
  const supabase = useMemo(() => createClient(), [])
  const [data, setData] = useState<ClassroomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyKey, setBusyKey] = useState("")
  const [showEnterModal, setShowEnterModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [enteringCourse, setEnteringCourse] = useState<Course | null>(null)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [teacherCourse, setTeacherCourse] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [teacherEmail, setTeacherEmail] = useState("")

  const loadClassrooms = useCallback(async (initialLoad = false) => {
    if (initialLoad) setLoading(true)
    try {
      const response = await fetch("/api/admin/classrooms", { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to load classroom management.")
      setData(result as ClassroomData)
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load classroom management.")
    } finally {
      if (initialLoad) setLoading(false)
    }
  }, [])

  useEffect(() => { void loadClassrooms(true) }, [loadClassrooms])

  useEffect(() => {
    let refreshTimer: number | undefined
    const channel = supabase
      .channel("admin-classroom-management")
      .on("postgres_changes", { event: "*", schema: "public", table: "classroom_courses" }, () => {
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => void loadClassrooms(), 150)
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "classroom_rooms" }, () => {
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => void loadClassrooms(), 150)
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "classroom_teachers" }, () => {
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => void loadClassrooms(), 150)
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "classroom_students" }, () => {
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => void loadClassrooms(), 150)
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => void loadClassrooms(), 150)
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Live classroom management updates unavailable:", error ?? status)
        }
      })

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      void supabase.removeChannel(channel)
    }
  }, [loadClassrooms, supabase])

  useEffect(() => {
    if (!enteringCourse) return
    const timer = window.setTimeout(() => {
      router.push(`/dashboard/classrooms/${enteringCourse.slug}`)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [enteringCourse, router])

  const courseTitle = useMemo(
    () => new Map((data?.courses ?? []).map((course) => [course.slug, course.title])),
    [data],
  )
  const getRoom = (slug: string) => data?.rooms.find((room) => room.course_slug === slug)
  const roomLocked = (slug: string) => getRoom(slug)?.is_locked ?? false

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
      setNotice(result.message || "Classroom settings updated.")
      setData((current) => {
        if (!current) return current
        if (body.action === "set-lock" && result.data) {
          return { ...current, rooms: current.rooms.map((room) => room.course_slug === result.data.course_slug
            ? { ...room, is_locked: result.data.is_locked }
            : room) }
        }
        if (body.action === "set-teacher-email" && result.data) {
          return { ...current, rooms: current.rooms.map((room) => room.course_slug === result.data.course_slug
            ? { ...room, ...result.data }
            : room) }
        }
        if (body.action === "update-status" && result.data) {
          if (body.type === "teacher") {
            return { ...current, teachers: current.teachers.map((teacher) => teacher.id === result.data.id
              ? { ...teacher, status: result.data.status }
              : teacher) }
          }
          return { ...current, students: current.students.map((entry) => entry.student_id === result.data.studentId
            ? {
                ...entry,
                status: result.data.status,
                student: entry.student
                  ? { ...entry.student, restricted: result.data.status === "restricted" }
                  : entry.student,
              }
            : entry) }
        }
        if (body.action === "restore-student" && result.data) {
          return { ...current, students: current.students.map((entry) => entry.student_id === result.data.studentId
            ? { ...entry, status: "pending", student: entry.student ? { ...entry.student, restricted: false } : entry.student }
            : entry) }
        }
        return current
      })
      return true
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update classroom access.")
      return false
    } finally {
      setBusyKey("")
    }
  }

  const saveTeacherEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const saved = await postAction({
      action: "set-teacher-email",
      courseSlug: teacherCourse,
      email: teacherEmail,
      displayName: teacherName,
    }, "set-teacher-email")
    if (saved) {
      setShowTeacherModal(false)
      setTeacherName("")
      setTeacherEmail("")
      setTeacherCourse("")
    }
  }

  const teachers = data?.teachers ?? []
  const students = data?.students ?? []
  const pendingTeachers = teachers.filter(({ status }) => status === "pending").length
  const pendingStudents = students.filter(({ status }) => status === "pending").length
  const approvedTeachers = teachers.filter(({ status }) => status === "approved").length

  return (
    <main className="space-y-6 pb-10">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-gradient-to-br from-[#092e22] via-[#0f5134] to-[#0a382a] px-5 py-6 text-white shadow-xl shadow-emerald-950/10 sm:px-8 sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
              Academy operations
              <span className="ml-1 flex items-center gap-1.5 border-l border-white/20 pl-2.5 normal-case tracking-normal text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
                Workspace live
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Classroom Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/75">
              Your classes, people, and access controls — all moving in one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-white/80">
              <span className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">{data?.courses.length ?? 0} courses</span>
              <span className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">{pendingTeachers + pendingStudents} awaiting review</span>
            </div>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" onClick={() => setShowEnterModal(true)} className="classroom-hero-primary group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-emerald-950 shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900">
              <DoorOpen aria-hidden="true" className="h-4 w-4" /> Enter a class
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button type="button" onClick={() => { setTeacherCourse(""); setTeacherEmail(""); setTeacherName(""); setShowTeacherModal(true) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-4 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Plus aria-hidden="true" className="h-4 w-4" /> Add teacher
            </button>
            <a href={pendingStudents > 0 ? "#student-approvals" : "#teacher-approvals"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-emerald-100 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Review requests <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {(error || notice) && (
        <div role={error ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
          error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}>
          <p>{error || notice}</p>
          <button type="button" aria-label="Dismiss message" onClick={() => { setError(""); setNotice("") }}><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Classroom overview">
        {[
          { label: "Active classes", value: data?.courses.length ?? 0, detail: `${students.length} student records`, icon: BookOpenCheck, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Approved teachers", value: approvedTeachers, detail: `${teachers.length} assigned`, icon: BadgeCheck, tone: "bg-sky-50 text-sky-700" },
          { label: "Teachers awaiting approval", value: pendingTeachers, detail: "Awaiting review", icon: Users, tone: "bg-amber-50 text-amber-800", href: "#teacher-approvals" },
          { label: "Students awaiting approval", value: pendingStudents, detail: "Awaiting review", icon: GraduationCap, tone: "bg-violet-50 text-violet-700", href: "#student-approvals" },
        ].map(({ label, value, detail, icon: Icon, tone, href }) => {
          const content = (
            <>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                <span className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">{loading && !data ? "—" : value}</span>
                  <span className="truncate text-[11px] text-muted-foreground">{detail}</span>
                </span>
              </span>
              {href && <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </>
          )
          return href ? (
            <a key={label} href={href} className="dashboard-card flex min-h-24 items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
              {content}
            </a>
          ) : (
            <article key={label} className="dashboard-card flex min-h-24 items-center gap-3 rounded-2xl p-4">
              {content}
            </article>
          )
        })}
      </section>

      <section id="classes" className="dashboard-card scroll-mt-24 rounded-2xl p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Classes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage class access and jump into a course workspace.</p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{data?.courses.length ?? 0} courses</span>
        </div>
        {loading && !data ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading classes…</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(data?.courses ?? []).map((course) => {
              const teacher = teachers.find((item) => item.course_slug === course.slug && item.status !== "restricted")
              const classStudents = students.filter((item) => item.course_slug === course.slug)
              const configuredRoom = getRoom(course.slug)
              const locked = roomLocked(course.slug)
              return (
                <article key={course.slug} className="group flex min-w-0 flex-col rounded-2xl border border-border/60 bg-background p-4 transition duration-200 hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-950/[0.06]">
                  <div className="flex min-w-0 flex-wrap items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-900/[0.04] transition duration-200 group-hover:scale-105 group-hover:shadow-sm"><BookOpenCheck aria-hidden="true" className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Course workspace</p>
                      <h3 className="truncate text-sm font-semibold tracking-tight">{course.title}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{configuredRoom?.teacher_email || teacher?.email || "Teacher email not configured"}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busyKey === `lock-${course.slug}`}
                      onClick={() => void postAction({ action: "set-lock", courseSlug: course.slug, locked: !locked }, `lock-${course.slug}`)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition disabled:opacity-50 ${locked ? "border-amber-200/70 bg-amber-50 text-amber-800 hover:bg-amber-100" : "border-emerald-200/70 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
                      aria-label={`${locked ? "Unlock" : "Lock"} ${course.title} class`}
                    >
                      {busyKey === `lock-${course.slug}` ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : locked ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                      {locked ? "Locked" : "Open"}
                    </button>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"><Users className="h-3.5 w-3.5" />{classStudents.length} {classStudents.length === 1 ? "student" : "students"}</span>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                      <button type="button" onClick={() => { setTeacherCourse(course.slug); setTeacherEmail(configuredRoom?.teacher_email ?? ""); setTeacherName(configuredRoom?.teacher_display_name ?? ""); setShowTeacherModal(true) }} className="min-h-9 rounded-xl border border-border px-2 sm:px-3 text-xs font-semibold transition hover:bg-muted">Teacher email</button>
                      <button type="button" onClick={() => setSelectedCourse(course)} className="group/launch inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-2 sm:px-3 text-xs font-semibold text-white shadow-sm shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
                        Open class <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover/launch:translate-x-0.5 group-hover/launch:-translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-2">
        <section id="teacher-approvals" className="dashboard-card scroll-mt-24 rounded-2xl p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Teacher approvals</h2>
              <p className="mt-1 text-xs text-muted-foreground">Review teacher access for each course.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">{pendingTeachers} pending</span>
          </div>
          <div className="space-y-2">
            {teachers.length === 0 ? <div className="rounded-xl border border-dashed border-border/60 px-4 py-7 text-center"><p className="text-xs text-muted-foreground">No teachers assigned yet.</p><button type="button" onClick={() => setShowTeacherModal(true)} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold transition hover:border-emerald-700/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"><Plus aria-hidden="true" className="h-3.5 w-3.5" /> Add your first teacher</button></div> : teachers.map((teacher) => (
              <article key={teacher.id} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Users className="h-4 w-4" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{teacher.display_name}</p><p className="truncate text-xs text-muted-foreground">{courseTitle.get(teacher.course_slug) ?? teacher.course_slug} · {teacher.email}</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end"><StatusBadge status={teacher.status} />
                  {teacher.status === "pending" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "teacher", id: teacher.id, status: "approved" }, `teacher-${teacher.id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md disabled:opacity-50"><Check aria-hidden="true" className="h-3.5 w-3.5" /> Approve</button>}
                  {teacher.status === "restricted" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "teacher", id: teacher.id, status: "pending" }, `teacher-${teacher.id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"><UnlockKeyhole aria-hidden="true" className="h-3.5 w-3.5" /> Restore</button>}
                  {teacher.status !== "restricted" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "teacher", id: teacher.id, status: "restricted" }, `teacher-${teacher.id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-rose-200/70 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"><ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" /> Restrict</button>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="student-approvals" className="dashboard-card scroll-mt-24 rounded-2xl p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Student approvals</h2>
              <p className="mt-1 text-xs text-muted-foreground">Check course and payment status before approving access.</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{pendingStudents} pending</span>
          </div>
          <div className="space-y-2">
            {students.length === 0 ? <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-xs text-muted-foreground">No student classroom records yet.</p> : students.map((entry) => (
              <article key={entry.student_id} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><GraduationCap className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{entry.student?.name || "Learner"}</p>
                      <StatusBadge status={entry.student?.restricted ? "restricted" : entry.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{courseTitle.get(entry.course_slug) ?? entry.course_slug} · {entry.student?.email ?? "No email"}</p>
                    <span className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{entry.student?.payment_status ?? "Payment not recorded"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 border-t border-border/60 pt-2">
                  {entry.status !== "approved" && !entry.student?.restricted && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "student", id: entry.student_id, status: "approved" }, `student-${entry.student_id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md disabled:opacity-50"><Check aria-hidden="true" className="h-3.5 w-3.5" /> Approve</button>}
                  {(entry.status === "restricted" || entry.student?.restricted) && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "restore-student", id: entry.student_id }, `student-${entry.student_id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"><UnlockKeyhole aria-hidden="true" className="h-3.5 w-3.5" /> Restore</button>}
                  {entry.status !== "restricted" && <button type="button" disabled={Boolean(busyKey)} onClick={() => void postAction({ action: "update-status", type: "student", id: entry.student_id, status: "restricted" }, `student-${entry.student_id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-rose-200/70 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"><ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" /> Restrict</button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {showEnterModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowEnterModal(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="enter-class-title" className="w-full max-w-lg rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between"><div><h2 id="enter-class-title" className="text-base font-semibold">Choose a class</h2><p className="mt-1 text-xs text-muted-foreground">As admin, you can always enter. Locking a class only blocks teachers and students.</p></div><button type="button" onClick={() => setShowEnterModal(false)} aria-label="Close class selection"><X className="h-4 w-4" /></button></div>
            <div className="mt-4 grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
              {(data?.courses ?? []).map((course) => <button key={course.slug} type="button" onClick={() => { setShowEnterModal(false); setSelectedCourse(course) }} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-3 text-left text-sm font-medium hover:bg-muted/50">{course.title}<ArrowRight className="h-4 w-4 text-muted-foreground" /></button>)}
            </div>
          </section>
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-enter-class-title" className="w-full max-w-sm rounded-2xl bg-background p-6 text-center shadow-2xl">
            {enteringCourse ? (
              <>
                <LoaderCircle aria-hidden="true" className="mx-auto h-10 w-10 animate-spin text-emerald-700" />
                <h2 id="confirm-enter-class-title" className="mt-4 text-lg font-semibold">Welcome to the classroom</h2>
                <p className="mt-1 text-sm text-muted-foreground">Preparing your {selectedCourse.title} group…</p>
              </>
            ) : (
              <>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><DoorOpen aria-hidden="true" className="h-6 w-6" /></span>
                <h2 id="confirm-enter-class-title" className="mt-4 text-lg font-semibold">You’re about to enter the classroom</h2>
                <p className="mt-2 text-sm text-muted-foreground">Enter the <span className="font-semibold text-foreground">{selectedCourse.title}</span> group as an administrator?</p>
                <div className="mt-6 flex justify-center gap-2">
                  <button type="button" onClick={() => setSelectedCourse(null)} className="min-h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">Not now</button>
                  <button type="button" onClick={() => setEnteringCourse(selectedCourse)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">Yes, enter</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {showTeacherModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="add-teacher-title" className="w-full max-w-md rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between"><div><h2 id="add-teacher-title" className="text-base font-semibold">Manage teacher email</h2><p className="mt-1 text-xs text-muted-foreground">Only this email can request a teacher sign-in code for the selected class.</p></div><button type="button" onClick={() => setShowTeacherModal(false)} aria-label="Close teacher form"><X className="h-4 w-4" /></button></div>
            <form onSubmit={(event) => void saveTeacherEmail(event)} className="space-y-4">
              <label className="block space-y-1.5 text-xs font-medium">Course<select required value={teacherCourse} onChange={(event) => { const slug = event.target.value; const room = getRoom(slug); setTeacherCourse(slug); setTeacherEmail(room?.teacher_email ?? ""); setTeacherName(room?.teacher_display_name ?? "") }} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="">Select a course</option>{(data?.courses ?? []).map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}</select></label>
              <label className="block space-y-1.5 text-xs font-medium">Teacher email<input type="email" value={teacherEmail} onChange={(event) => setTeacherEmail(event.target.value)} placeholder="teacher@example.com" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /></label>
              <label className="block space-y-1.5 text-xs font-medium">Display name (optional)<input maxLength={80} value={teacherName} onChange={(event) => setTeacherName(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /></label>
              <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> Changing the assigned email immediately restricts the previous teacher. Leave the email blank to remove the assignment.</p>
              <button disabled={busyKey === "set-teacher-email" || !teacherCourse} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{busyKey === "set-teacher-email" && <LoaderCircle className="h-4 w-4 animate-spin" />}Save teacher email</button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
