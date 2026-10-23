"use client"

import { useMemo } from "react"
import { Download } from "lucide-react"
import { PageHeader } from "../components/dashboard/page-header"
import { Button } from "../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { useStudents } from "@/lib/hooks/use-students"
import type { Student } from "@/lib/stores/student-store"

const paymentStatuses = [
  "Paid",
  "First Installment",
  "Second Installment",
  "Not Paid Yet",
]

const paymentStatusLabels: Record<string, string> = {
  "Fully Paid": "Paid",
  "1st Installment": "First Installment",
  "2nd Installment": "Second Installment",
  "Not Paid": "Not Paid Yet",
}

function createCsv(students: Student[]) {
  const rows = [
    ["Name", "Email", "Course", "Payment status", "Country", "Registered"],
    ...students.map((student) => [
      student.name,
      student.email,
      student.course,
      student.payment_status,
      student.country,
      student.created_at || "",
    ]),
  ]
  return rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\r\n")
}

function exportStudents(students: Student[]) {
  const blob = new Blob(["\uFEFF", createCsv(students)], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "tech-trailblazer-academy-students.csv"
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export default function AnalyticsPage() {
  const { students, isLoading, isFetching, error, refetch } = useStudents()

  const { monthlyRegistrations, courseCounts, paymentCounts } = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return {
        key: getMonthKey(date),
        month: new Intl.DateTimeFormat("en", {
          month: "short",
          year: "numeric",
        }).format(date),
        registrations: 0,
      }
    })
    const monthByKey = new Map(months.map((month) => [month.key, month]))
    const courses = new Map<string, number>()
    const payments = new Map(paymentStatuses.map((status) => [status, 0]))

    for (const student of students) {
      const createdAt = student.created_at ? new Date(student.created_at) : null
      if (createdAt && !Number.isNaN(createdAt.getTime())) {
        const month = monthByKey.get(getMonthKey(createdAt))
        if (month) month.registrations += 1
      }

      const course = student.course?.trim() || "Unspecified"
      courses.set(course, (courses.get(course) || 0) + 1)

      const status = paymentStatusLabels[student.payment_status]
        || student.payment_status
        || "Unknown"
      payments.set(status, (payments.get(status) || 0) + 1)
    }

    return {
      monthlyRegistrations: months,
      courseCounts: [...courses.entries()].sort((a, b) => b[1] - a[1]),
      paymentCounts: [...payments.entries()],
    }
  }, [students])

  return (
    <>
      <PageHeader title="Analytics" description="Registration and payment summaries.">
        <Button
          variant="outline"
          className="h-9 gap-2"
          onClick={() => exportStudents(students)}
          disabled={isLoading || students.length === 0}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>

      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            Could not load registrations
            {error instanceof Error ? `: ${error.message}` : "."}
          </span>
          <Button
            variant="outline"
            className="h-8 border-red-200 bg-white text-red-800 hover:bg-red-100"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !error && students.length === 0 ? (
        <div className="border border-border bg-card px-5 py-12 text-center">
          <h2 className="text-base font-medium">No registration data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Analytics will appear when students register.
          </p>
        </div>
      ) : error && students.length === 0 ? null : (
        <div className="grid gap-8 xl:grid-cols-2">
          <section aria-labelledby="monthly-registrations-heading">
            <h2
              id="monthly-registrations-heading"
              className="mb-3 text-base font-semibold tracking-tight"
            >
              Registrations by month
            </h2>
            <div className="overflow-hidden border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="h-10 pl-4 text-xs text-muted-foreground">
                      Month
                    </TableHead>
                    <TableHead className="h-10 pr-4 text-right text-xs text-muted-foreground">
                      Registrations
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 6 }, (_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={2} className="h-11 px-4">
                            <div className="h-3 w-1/2 animate-pulse bg-muted" />
                          </TableCell>
                        </TableRow>
                      ))
                    : monthlyRegistrations.map((month) => (
                        <TableRow key={month.key}>
                          <TableCell className="pl-4">{month.month}</TableCell>
                          <TableCell className="pr-4 text-right tabular-nums">
                            {month.registrations}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section aria-labelledby="course-registrations-heading">
            <h2
              id="course-registrations-heading"
              className="mb-3 text-base font-semibold tracking-tight"
            >
              Registrations by course
            </h2>
            <div className="overflow-hidden border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="h-10 pl-4 text-xs text-muted-foreground">
                      Course
                    </TableHead>
                    <TableHead className="h-10 pr-4 text-right text-xs text-muted-foreground">
                      Students
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={2} className="h-11 px-4">
                          <div className="h-3 w-1/2 animate-pulse bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : courseCounts.length > 0 ? (
                    courseCounts.map(([course, count]) => (
                      <TableRow key={course}>
                        <TableCell className="pl-4">{course}</TableCell>
                        <TableCell className="pr-4 text-right tabular-nums">
                          {count}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="h-20 px-4 text-center text-sm text-muted-foreground"
                      >
                        No course data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section aria-labelledby="payment-status-heading">
            <h2
              id="payment-status-heading"
              className="mb-3 text-base font-semibold tracking-tight"
            >
              Payment status
            </h2>
            <div className="overflow-hidden border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="h-10 pl-4 text-xs text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 pr-4 text-right text-xs text-muted-foreground">
                      Students
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentCounts.map(([status, count]) => (
                    <TableRow key={status}>
                      <TableCell className="pl-4">{status}</TableCell>
                      <TableCell className="pr-4 text-right tabular-nums">
                        {isLoading ? "—" : count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
