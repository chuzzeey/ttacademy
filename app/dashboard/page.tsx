"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Period = "7d" | "30d" | "90d" | "12m" | "all"
type CountItem = { label: string; count: number }
type TrendItem = { period: string; registrations: number }
type RecentRegistration = {
  id: string
  name: string
  course: string | null
  country: string | null
  state: string | null
  paymentStatus: string | null
  createdAt: string
}
type AnalyticsData = {
  period: Period
  rangeStart: string
  rangeEnd: string
  totalStudents: number
  periodRegistrations: number
  previousPeriodRegistrations: number | null
  locationLabel: string
  trend: TrendItem[]
  locations: CountItem[]
  courses: CountItem[]
  sexDistribution: CountItem[]
  paymentStatuses: CountItem[]
  weekdays: CountItem[]
  recentRegistrations: RecentRegistration[]
}

const periods: { value: Period; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
]
const chartColors = ["#16a36a", "#5b8def", "#9b7aea", "#e8a342", "#e36b78", "#56a9aa"]
const numberFormat = new Intl.NumberFormat("en")

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date)
}

function formatTrendLabel(value: string, period: Period) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en", period === "12m" || period === "all"
    ? { month: "short", year: "2-digit" }
    : period === "90d"
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "short" }).format(date)
}

function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-6 ${className}`}>
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function ChartEmpty({ message = "No registrations in this period" }: { message?: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-xl bg-slate-50/80 px-3 py-4 text-center text-xs leading-5 text-slate-500 sm:min-h-28 sm:px-5">
      {message}
    </div>
  )
}

function DistributionChart({
  items,
  color = "#16a36a",
  height = 230,
  name,
}: {
  items: CountItem[]
  color?: string
  height?: number
  name: string
}) {
  if (!items.length) return <ChartEmpty />
  const data = items.slice(0, 8)

  return (
    <div className="min-w-0">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="#eef1f4" />
            <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="label"
              width={92}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(label: string) => label.length > 15 ? `${label.slice(0, 14)}…` : label}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              formatter={(value: number) => [numberFormat.format(value), name]}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {items.length > 8 && (
        <p className="mt-2 text-right text-[11px] text-slate-400">
          Showing 8 of {items.length} groups
        </p>
      )}
    </div>
  )
}

function DonutChart({ items, label }: { items: CountItem[]; label: string }) {
  if (!items.length) return <ChartEmpty />
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="grid min-w-0 grid-cols-[minmax(112px,0.8fr)_minmax(0,1.2fr)] items-center gap-3 sm:gap-5">
      <div className="h-40 min-w-0 sm:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="count"
              nameKey="label"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
            >
              {items.map((item, index) => (
                <Cell key={`${item.label}-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [numberFormat.format(value), name]}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 space-y-2.5">
        {items.map((item, index) => (
          <li key={`${label}-${item.label}`} className="flex min-w-0 items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
            <span className="min-w-0 flex-1 truncate text-slate-600" title={item.label}>{item.label}</span>
            <span className="shrink-0 font-medium tabular-nums text-slate-900">
              {total ? `${Math.round((item.count / total) * 100)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadAnalytics() {
      setIsLoading(true)
      setError("")
      setData(null)
      try {
        const response = await fetch(`/api/admin/analytics?period=${period}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || "Unable to load dashboard analytics.")
        }
        setData(result as AnalyticsData)
      } catch (loadError) {
        if (controller.signal.aborted) return
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard analytics.")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadAnalytics()
    return () => controller.abort()
  }, [period, retryKey])

  const paidCount = useMemo(
    () => data?.paymentStatuses.find(({ label }) => label === "Fully Paid")?.count ?? 0,
    [data],
  )
  const unpaidCount = useMemo(
    () => data?.paymentStatuses
      .filter(({ label }) => label === "Not Paid" || label === "Not Paid Yet")
      .reduce((count, status) => count + status.count, 0) ?? 0,
    [data],
  )
  const periodChange = useMemo(() => {
    if (!data || data.previousPeriodRegistrations === null || data.previousPeriodRegistrations === 0) return null
    return Math.round(((data.periodRegistrations - data.previousPeriodRegistrations) / data.previousPeriodRegistrations) * 100)
  }, [data])

  return (
    <main className="min-w-0 space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">Academy administration</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Overview</h1>
          <p className="mt-1.5 text-sm text-slate-500">A live view of learner registrations and enrollment activity.</p>
        </div>
        <label className="relative block w-full sm:hidden">
          <span className="sr-only">Analytics date range</span>
          <select
            value={period}
            onChange={(event) => {
              const selectedPeriod = periods.find((option) => option.value === event.target.value)
              if (selectedPeriod) setPeriod(selectedPeriod.value)
            }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm"
          >
            {periods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <CalendarDays aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>
        <div className="hidden max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 sm:flex" role="group" aria-label="Analytics date range">
          {periods.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              aria-pressed={period === option.value}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                period === option.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-rose-800">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100 sm:self-auto"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Enrollment summary">
        {[
          { label: "All learners", value: data?.totalStudents, icon: Users, note: "Registered in the academy" },
          {
            label: "New registrations",
            value: data?.periodRegistrations,
            icon: Activity,
            note: periodChange === null
              ? data?.previousPeriodRegistrations === null ? "All-time view" : "No previous-period baseline"
              : `${periodChange > 0 ? "+" : ""}${periodChange}% vs previous period`,
            trend: periodChange,
          },
          { label: "Fully paid", value: paidCount, icon: GraduationCap, note: "Within selected date range" },
          { label: "Not paid", value: unpaidCount, icon: CalendarDays, note: "Within selected date range" },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <article key={metric.label} className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">{metric.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <Icon size={16} strokeWidth={1.8} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
                  {isLoading || !data ? "—" : numberFormat.format(metric.value ?? 0)}
                </span>
                {metric.trend !== undefined && metric.trend !== null && (
                  <span className={`inline-flex items-center text-xs font-medium ${metric.trend >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {metric.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{metric.note}</p>
            </article>
          )
        })}
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Registration trend" description="New learner registrations over the selected period." className="xl:col-span-2">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
          ) : error ? <ChartEmpty message="Unable to load analytics data." /> : data?.periodRegistrations === 0 ? (
            <ChartEmpty message="No registrations in this period." />
          ) : data?.trend.length ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="registrationFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a36a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a36a" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eef1f4" />
                  <XAxis
                    dataKey="period"
                    tickFormatter={(value: string) => formatTrendLabel(value, period)}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(value: string) => formatDate(value, { weekday: "short" })}
                    formatter={(value: number) => [numberFormat.format(value), "Registrations"]}
                    contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="#159765" strokeWidth={2.5} fill="url(#registrationFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty />}
        </Panel>

        <Panel title={data?.locationLabel ? `Registrations by ${data.locationLabel.toLowerCase()}` : "Registrations by location"} description="Learner location recorded at registration.">
          {isLoading ? <div className="h-56 animate-pulse rounded-xl bg-slate-50" /> : error ? <ChartEmpty message="Unable to load analytics data." /> : (
            <DistributionChart items={data?.locations ?? []} color="#5b8def" name="Learners" />
          )}
        </Panel>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Popular courses" description="Course selections from registrations in this date range.">
          {isLoading ? <div className="h-56 animate-pulse rounded-xl bg-slate-50" /> : error ? <ChartEmpty message="Unable to load analytics data." /> : (
            <DistributionChart items={data?.courses ?? []} color="#16a36a" name="Registrations" />
          )}
        </Panel>
        <Panel title="Payment status" description="Recorded status of registrations in this date range.">
          {isLoading ? <div className="h-40 animate-pulse rounded-xl bg-slate-50" /> : error ? <ChartEmpty message="Unable to load analytics data." /> : (
            <DonutChart items={data?.paymentStatuses ?? []} label="payment" />
          )}
        </Panel>
        <Panel title="Learner profile" description="Sex distribution, including records without a value.">
          {isLoading ? <div className="h-40 animate-pulse rounded-xl bg-slate-50" /> : error ? <ChartEmpty message="Unable to load analytics data." /> : (
            <DonutChart items={data?.sexDistribution ?? []} label="profile" />
          )}
        </Panel>
        <Panel title="Registration by weekday" description="Which days learners most often register.">
          {isLoading ? <div className="h-56 animate-pulse rounded-xl bg-slate-50" /> : error ? <ChartEmpty message="Unable to load analytics data." /> : (
            <DistributionChart items={data?.weekdays ?? []} color="#9b7aea" name="Registrations" height={230} />
          )}
        </Panel>
      </div>

      <Panel
        title="Recent registrations"
        description={data ? `${numberFormat.format(data.periodRegistrations)} registrations in the selected date range.` : "Latest learner activity."}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((row) => <div key={row} className="h-11 animate-pulse rounded-lg bg-slate-50" />)}
          </div>
        ) : error ? (
          <ChartEmpty message="Unable to load recent registrations." />
        ) : data?.recentRegistrations.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4">Learner</th>
                    <th className="pb-3 pr-4">Course</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Payment status</th>
                    <th className="pb-3 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentRegistrations.map((student) => (
                    <tr key={student.id} className="text-slate-600">
                      <td className="py-3 pr-4 font-medium text-slate-900">{student.name || "Unnamed learner"}</td>
                      <td className="py-3 pr-4">{student.course || "Unspecified"}</td>
                      <td className="py-3 pr-4">{[student.state, student.country].filter(Boolean).join(", ") || "Not provided"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          student.paymentStatus === "Fully Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : student.paymentStatus === "Not Paid" || student.paymentStatus === "Not Paid Yet"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                        }`}>
                          {student.paymentStatus === "Fully Paid"
                            ? "Paid"
                            : student.paymentStatus === "Not Paid"
                              ? "Not Paid Yet"
                              : student.paymentStatus || "Not recorded"}
                        </span>
                      </td>
                      <td className="py-3 text-right text-xs text-slate-500">{formatDate(student.createdAt, { hour: "numeric", minute: "2-digit" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/students" className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
                View all learners <span aria-hidden="true">→</span>
              </Link>
            </div>
          </>
        ) : (
          <ChartEmpty message="No registrations in this period." />
        )}
      </Panel>

      <p className="text-center text-[11px] text-slate-400">
        Enrollment metrics reflect student records; financial totals are not shown because verified transaction amounts are not available.
      </p>
    </main>
  )
}
