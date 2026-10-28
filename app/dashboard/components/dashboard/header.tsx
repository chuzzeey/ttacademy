"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpenCheck,
  Check,
  ChevronRight,
  Moon,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react"
import { BRAND_LOGO_URL } from "@/lib/brand"
import { useAdminProfile } from "@/lib/hooks/use-admin-profile"
import { formatRegistrationDate } from "@/lib/format-registration-date"
import { useAdminTheme } from "./admin-theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

type RecentRegistration = {
  id: string
  name: string
  course: string | null
  country: string | null
  state: string | null
  paymentStatus: string | null
  createdAt: string
}

type LogoutPhase = "confirm" | "signing-out" | "success" | "error"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Email", href: "/dashboard/email", icon: Mail },
  { label: "Payment Proof", href: "/dashboard/payment-proofs", icon: ReceiptText },
  { label: "Security", href: "/dashboard/profile#security", icon: ShieldCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

function formatPaymentStatus(value: string | null) {
  if (!value || value === "Not Paid") return "Not Paid Yet"
  return value
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, name, email, avatarUrl, supabase } = useAdminProfile()
  const { theme, toggleTheme } = useAdminTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<RecentRegistration[]>([])
  const [unreadPaymentProofCount, setUnreadPaymentProofCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<RecentRegistration | null>(null)
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([])
  const [readStateLoaded, setReadStateLoaded] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [notificationError, setNotificationError] = useState("")
  const [logoutPhase, setLogoutPhase] = useState<LogoutPhase | null>(null)
  const [logoutError, setLogoutError] = useState("")
  const notificationDialogRef = useRef<HTMLElement>(null)
  const notificationTriggerRef = useRef<HTMLButtonElement>(null)
  const notificationRequestRef = useRef(false)
  const paymentProofNotificationRequestRef = useRef(0)
  const notificationOpenRef = useRef(notificationOpen)
  notificationOpenRef.current = notificationOpen
  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notificationStorageKey = user ? `academy-notification-read:${user.id}` : null
  const unreadCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length
  const totalUnreadCount = unreadCount + unreadPaymentProofCount

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname.startsWith(href.split("#")[0])
  }
  const openMobileMenu = () => {
    if (drawerCloseTimerRef.current) clearTimeout(drawerCloseTimerRef.current)
    setMobileMenuMounted(true)
    window.requestAnimationFrame(() => setMobileMenuOpen(true))
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    if (drawerCloseTimerRef.current) clearTimeout(drawerCloseTimerRef.current)
    drawerCloseTimerRef.current = setTimeout(() => setMobileMenuMounted(false), 440)
  }

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "dark"}
      className="admin-theme-toggle inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-emerald-800"
    >
      {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
      <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
    </button>
  )

  const loadNotifications = useCallback(async () => {
    if (notificationRequestRef.current) return
    notificationRequestRef.current = true
    setNotificationLoading(true)
    setNotificationError("")
    try {
      const response = await fetch("/api/admin/analytics?period=7d", { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to load recent activity.")
      setNotifications(result.recentRegistrations ?? [])
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : "Unable to load recent activity.")
    } finally {
      setNotificationLoading(false)
      notificationRequestRef.current = false
    }
  }, [])

  const loadUnreadPaymentProofCount = useCallback(async () => {
    const requestId = ++paymentProofNotificationRequestRef.current
    try {
      const response = await fetch("/api/admin/payment-proofs/notifications", { cache: "no-store" })
      const result = await response.json() as { unreadCount?: number; error?: string }
      if (!response.ok) throw new Error(result.error || "Unable to load payment proof notifications.")
      if (requestId === paymentProofNotificationRequestRef.current) {
        const unreadCount = typeof result.unreadCount === "number" && Number.isInteger(result.unreadCount)
          ? Math.max(0, result.unreadCount)
          : 0
        setUnreadPaymentProofCount(unreadCount)
      }
    } catch (error) {
      if (requestId === paymentProofNotificationRequestRef.current) {
        console.error("Unread payment proof count loading failed:", error)
        setNotificationError(error instanceof Error ? error.message : "Unable to load payment proof notifications.")
      }
    }
  }, [])

  const markPaymentProofsRead = useCallback(async () => {
    const requestId = ++paymentProofNotificationRequestRef.current
    try {
      const response = await fetch("/api/admin/payment-proofs/notifications", { method: "POST" })
      const result = await response.json() as { unreadCount?: number; error?: string }
      if (!response.ok) throw new Error(result.error || "Unable to mark payment proofs as seen.")
      if (requestId === paymentProofNotificationRequestRef.current) {
        const unreadCount = typeof result.unreadCount === "number" && Number.isInteger(result.unreadCount)
          ? Math.max(0, result.unreadCount)
          : 0
        setUnreadPaymentProofCount(unreadCount)
      }
    } catch (error) {
      console.error("Payment proof notification read update failed:", error)
      setNotificationError(error instanceof Error ? error.message : "Unable to mark payment proofs as seen.")
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`admin-notifications:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        if (notificationOpenRef.current) void loadNotifications()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_proofs" }, () => {
        void loadUnreadPaymentProofCount()
        if (notificationOpenRef.current) void loadNotifications()
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Live admin notification updates unavailable:", error ?? status)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadNotifications, loadUnreadPaymentProofCount, supabase, user])

  const toggleNotifications = () => {
    const nextOpen = !notificationOpen
    if (nextOpen) setSelectedNotification(null)
    else setSelectedNotification(null)
    setNotificationOpen(nextOpen)
    if (nextOpen) void loadNotifications()
  }

  const setNotificationRead = (id: string, read: boolean) => {
    if (!notificationStorageKey) return
    const nextReadIds = read
      ? Array.from(new Set([...readNotificationIds, id]))
      : readNotificationIds.filter((readId) => readId !== id)
    try {
      window.localStorage.setItem(notificationStorageKey, JSON.stringify(nextReadIds))
      setReadNotificationIds(nextReadIds)
    } catch {
      setNotificationError("Unable to save notification read status in this browser.")
    }
  }

  const markAllNotificationsRead = () => {
    if (notificationStorageKey) {
      const nextReadIds = Array.from(new Set([...readNotificationIds, ...notifications.map((item) => item.id)]))
      try {
        window.localStorage.setItem(notificationStorageKey, JSON.stringify(nextReadIds))
        setReadNotificationIds(nextReadIds)
      } catch {
        setNotificationError("Unable to save notification read status in this browser.")
      }
    }
    void markPaymentProofsRead()
  }

  const confirmLogout = async () => {
    setLogoutPhase("signing-out")
    setLogoutError("")
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setLogoutPhase("success")
      window.setTimeout(() => {
        router.replace("/admin-login")
      }, 1400)
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Unable to end the admin session.")
      setLogoutPhase("error")
    }
  }

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileMenuOpen])

  useEffect(() => () => {
    if (drawerCloseTimerRef.current) clearTimeout(drawerCloseTimerRef.current)
  }, [])

  useEffect(() => {
    void loadNotifications()
    void loadUnreadPaymentProofCount()
  }, [loadNotifications, loadUnreadPaymentProofCount])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadUnreadPaymentProofCount()
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [loadUnreadPaymentProofCount])

  useEffect(() => {
    if (pathname === "/dashboard/payment-proofs") void markPaymentProofsRead()
  }, [markPaymentProofsRead, pathname])

  useEffect(() => {
    if (!notificationStorageKey) {
      setReadStateLoaded(false)
      return
    }
    try {
      const stored = window.localStorage.getItem(notificationStorageKey)
      const parsed: unknown = stored ? JSON.parse(stored) : []
      if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) {
        throw new Error("Stored notification read status is invalid.")
      }
      setReadNotificationIds(parsed)
    } catch {
      setNotificationError("Unable to load notification read status from this browser.")
      setReadNotificationIds([])
    } finally {
      setReadStateLoaded(true)
    }
  }, [notificationStorageKey])

  useEffect(() => {
    if (!notificationOpen) return
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedNotification) setSelectedNotification(null)
        else setNotificationOpen(false)
        return
      }
      if (event.key !== "Tab") return
      const focusable = notificationDialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) {
        event.preventDefault()
        notificationDialogRef.current?.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === notificationDialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.body.style.overflow = "hidden"
    notificationDialogRef.current?.focus()
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      notificationTriggerRef.current?.focus()
    }
  }, [notificationOpen, selectedNotification])

  const navigation = (mobile = false) => (
    <nav aria-label="Main navigation" className="space-y-1">
      {navItems.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          onClick={mobile ? closeMobileMenu : undefined}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
            isActive(href)
              ? "bg-emerald-50 text-emerald-800"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {isActive(href) && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />}
          {href === "/dashboard/payment-proofs" && unreadPaymentProofCount > 0 && (
            <span aria-label={`${unreadPaymentProofCount} new payment proofs`} className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[10px] font-bold leading-none text-white">
              {unreadPaymentProofCount > 99 ? "99+" : unreadPaymentProofCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  )

  const classroomNavigation = (mobile = false) => (
    <Link
      href="/dashboard/classrooms"
      onClick={mobile ? closeMobileMenu : undefined}
      aria-current={isActive("/dashboard/classrooms") ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
        isActive("/dashboard/classrooms")
          ? "bg-emerald-50 text-emerald-800"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <BookOpenCheck aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">Classroom Management</span>
      {isActive("/dashboard/classrooms") && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600" />}
    </Link>
  )

  const profileLink = (mobile = false) => (
    <Link
      href="/dashboard/profile"
      onClick={mobile ? closeMobileMenu : undefined}
      className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
    >
      <Avatar className="h-10 w-10 ring-2 ring-slate-100">
        <AvatarImage src={avatarUrl || undefined} alt="" className="object-cover" />
        <AvatarFallback className="bg-emerald-50 text-xs font-semibold text-emerald-800">
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{email || "Administrator"}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )

  const notificationButton = (
    <button
      ref={notificationTriggerRef}
      type="button"
      aria-label={readStateLoaded && totalUnreadCount > 0 ? `Notifications, ${totalUnreadCount} unread` : "Notifications"}
      aria-expanded={notificationOpen}
      aria-haspopup="dialog"
      onClick={toggleNotifications}
      className="admin-notification-trigger relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-emerald-800"
    >
      <Bell aria-hidden="true" className="h-[18px] w-[18px]" />
      {readStateLoaded && totalUnreadCount > 0 && (
        <span className="admin-notification-badge absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-emerald-600 px-1 text-[9px] font-bold leading-none text-white">
          {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
        </span>
      )}
    </button>
  )

  return (
    <>
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-slate-200/80 bg-white lg:flex">
        <Link
          href="/dashboard"
          className="flex min-h-[92px] items-center gap-4 border-b border-slate-100 px-6"
          aria-label="Tech Trailblazer Academy overview"
        >
          <span className="flex h-[4.25rem] w-[4.75rem] shrink-0 items-center justify-center rounded-2xl bg-white p-1.5">
            <img src={BRAND_LOGO_URL} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="text-[15px] font-semibold leading-5 tracking-tight text-slate-900">
            Tech Trailblazer Academy
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-5">{themeToggle}</div>
          <div className="mb-5">{classroomNavigation()}</div>
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Workspace</p>
          {navigation()}
        </div>

        <div className="border-t border-slate-100 p-4">
          {profileLink()}
          <button
            type="button"
            onClick={() => setLogoutPhase("confirm")}
            className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut aria-hidden="true" className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>
      </aside>

      <header className="admin-topbar fixed inset-x-0 top-0 z-30 h-[4.25rem] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:left-[17rem] lg:h-[4.75rem]">
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-admin-navigation"
              onClick={openMobileMenu}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 lg:hidden">
              <img src={BRAND_LOGO_URL} alt="" className="h-10 w-11 shrink-0 object-contain sm:h-11 sm:w-12" />
              <span className="max-w-[min(28vw,15rem)] truncate text-xs font-semibold tracking-tight text-slate-900 max-[360px]:hidden sm:text-sm">
                Tech Trailblazer Academy
              </span>
            </Link>
            <div className="hidden lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Academy workspace</p>
              <p className="mt-0.5 text-sm font-medium text-slate-500">Administration</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">{themeToggle}</div>
            {notificationButton}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Administrator account: ${name}`}
                  className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-100 sm:gap-2.5 sm:pl-2"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-slate-100 shadow-sm sm:h-10 sm:w-10">
                    <AvatarImage src={avatarUrl || undefined} alt="" className="object-cover" />
                    <AvatarFallback className="bg-emerald-50 text-xs font-semibold text-emerald-800">
                      {name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 sm:block">
                    <span className="block truncate text-xs font-semibold text-slate-800">{name}</span>
                    <span className="block truncate text-[10px] text-slate-500">Administrator</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl || undefined} alt="" className="object-cover" />
                    <AvatarFallback className="bg-emerald-50 text-xs font-semibold text-emerald-800">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/profile#security">Security</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLogoutPhase("confirm")} className="text-rose-700 focus:text-rose-700">
                  <LogOut aria-hidden="true" className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {notificationOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null)
              setNotificationOpen(false)
            }
          }}
        >
          <section
            ref={notificationDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            className="admin-notification-panel flex max-h-[min(44rem,calc(100dvh-1.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_100px_-28px_rgba(15,23,42,.5)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  {selectedNotification && (
                    <button
                      type="button"
                      aria-label="Back to notifications"
                      onClick={() => setSelectedNotification(null)}
                      className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    {selectedNotification ? <Activity aria-hidden="true" className="h-4 w-4" /> : <Bell aria-hidden="true" className="h-4 w-4" />}
                  </span>
                  <div>
                    <h2 id="notifications-title" className="max-w-[min(55vw,28rem)] truncate text-base font-semibold text-slate-900">
                      {selectedNotification ? selectedNotification.name || "New learner" : "Notifications"}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {selectedNotification ? "Registration details" : "Recent registrations and payment proofs"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!selectedNotification && totalUnreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="hidden min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 sm:inline-flex"
                  >
                    <Check aria-hidden="true" className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {totalUnreadCount} unread
                </span>
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => {
                    setSelectedNotification(null)
                    setNotificationOpen(false)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!selectedNotification && totalUnreadCount > 0 && (
              <div className="px-5 pt-3 sm:hidden">
                <button type="button" onClick={markAllNotificationsRead} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50">
                  <Check aria-hidden="true" className="h-3.5 w-3.5" /> Mark all as read
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              {notificationLoading ? (
                <div className="space-y-3 p-2" role="status" aria-label="Loading notifications">
                  {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-50" />)}
                </div>
              ) : notificationError ? (
                <div className="p-8 text-center">
                  <p role="alert" className="text-sm text-rose-700">{notificationError}</p>
                  <button type="button" onClick={() => void loadNotifications()} className="mt-3 min-h-9 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800">Try again</button>
                </div>
              ) : selectedNotification ? (
                <div className="mx-auto max-w-xl py-2">
                  <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <Activity aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">New registration</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{selectedNotification.name || "New learner"}</p>
                      </div>
                    </div>
                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-white/90 p-3.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Course</dt>
                        <dd className="mt-1.5 text-sm font-medium text-slate-900">{selectedNotification.course || "Course unspecified"}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white/90 p-3.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Payment status</dt>
                        <dd className="mt-1.5 text-sm font-medium text-slate-900">{formatPaymentStatus(selectedNotification.paymentStatus)}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white/90 p-3.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Location</dt>
                        <dd className="mt-1.5 text-sm font-medium text-slate-900">
                          {[selectedNotification.state, selectedNotification.country].filter(Boolean).join(", ") || "Location not provided"}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white/90 p-3.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Registered</dt>
                        <dd className="mt-1.5 text-sm font-medium text-slate-900">{formatRegistrationDate(selectedNotification.createdAt)}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3.5 py-3">
                      <span className="text-xs text-slate-600">Notification status</span>
                      <button
                        type="button"
                        onClick={() => setNotificationRead(selectedNotification.id, !readNotificationIds.includes(selectedNotification.id))}
                        className="text-xs font-semibold text-emerald-800 hover:underline"
                      >
                        Mark as {readNotificationIds.includes(selectedNotification.id) ? "unread" : "read"}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to all notifications
                  </button>
                </div>
              ) : notifications.length || unreadPaymentProofCount > 0 ? (
                <div className="space-y-3">
                  {unreadPaymentProofCount > 0 && (
                    <Link
                      href="/dashboard/payment-proofs"
                      onClick={() => setNotificationOpen(false)}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">New payment proof submissions</span>
                        <span className="mt-1 block text-xs text-slate-600">Review receipts and approve or reject the payment.</span>
                      </span>
                      <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 px-2 text-xs font-bold text-white">
                        {unreadPaymentProofCount > 99 ? "99+" : unreadPaymentProofCount}
                      </span>
                    </Link>
                  )}
                  {notifications.length > 0 && <ul className="space-y-2">
                  {notifications.map((item) => {
                    const isRead = readNotificationIds.includes(item.id)
                    return (
                      <li key={item.id} className={`group relative rounded-2xl border transition ${
                        isRead
                          ? "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                          : "border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationRead(item.id, true)
                            setSelectedNotification(item)
                          }}
                          aria-label={`View registration details for ${item.name || "new learner"}`}
                          className="flex w-full items-start gap-3 rounded-2xl p-3.5 pb-10 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 sm:gap-4 sm:p-4 sm:pb-10"
                        >
                          <span className={`relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isRead ? "bg-slate-100 text-slate-500" : "bg-white text-emerald-700 shadow-sm"
                          }`}>
                            <Activity aria-hidden="true" className="h-[18px] w-[18px]" />
                            {!isRead && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-600" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className={`truncate text-sm ${isRead ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>{item.name || "New learner"}</span>
                              {!isRead && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800">New</span>}
                            </span>
                            <span className="mt-1 block truncate text-xs text-slate-600">{item.course || "Course unspecified"}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-slate-500">{[item.state, item.country].filter(Boolean).join(", ") || "Location not provided"}</span>
                            <span className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{formatPaymentStatus(item.paymentStatus)}</span>
                              <span className="text-[10px] text-slate-400"><span className="font-medium">Registered</span> {formatRegistrationDate(item.createdAt)}</span>
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotificationRead(item.id, !isRead)}
                          aria-label={isRead ? `Mark ${item.name || "notification"} as unread` : `Mark ${item.name || "notification"} as read`}
                          className="absolute bottom-3 right-3 rounded-lg px-2 py-1 text-[10px] font-semibold text-emerald-800 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:bottom-4 sm:right-4"
                        >
                          Mark as {isRead ? "unread" : "read"}
                        </button>
                      </li>
                    )
                  })}
                  </ul>}
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><Bell aria-hidden="true" className="h-5 w-5" /></span>
                  <p className="mt-4 text-sm font-semibold text-slate-800">You’re all caught up</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">New learner registrations from the last 7 days will appear here.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:px-7">
              <span className="text-[11px] text-slate-500">
                {selectedNotification
                  ? "Learner registration notification"
                  : `${notifications.length} recent ${notifications.length === 1 ? "notification" : "notifications"}`}
              </span>
              <Link href="/dashboard/students" onClick={() => setNotificationOpen(false)} className="inline-flex min-h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50">
                Open student directory <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </div>
      )}

      {mobileMenuMounted && (
        <div
          className={`fixed inset-0 z-50 transition-[visibility] duration-[420ms] lg:hidden ${mobileMenuOpen ? "visible" : "invisible delay-[420ms]"}`}
          aria-hidden={!mobileMenuOpen}
        >
          <button
            type="button"
            aria-label="Close navigation"
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={closeMobileMenu}
            className={`absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          />
          <aside
            id="mobile-admin-navigation"
            aria-label="Mobile navigation"
            inert={!mobileMenuOpen}
            className={`admin-mobile-drawer absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex min-h-[82px] items-center justify-between border-b border-slate-100 px-4">
              <Link href="/dashboard" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-3">
                <img src={BRAND_LOGO_URL} alt="" className="h-12 w-14 shrink-0 object-contain" />
                <span className="text-sm font-semibold leading-5 text-slate-900">Tech Trailblazer Academy</span>
              </Link>
              <button type="button" tabIndex={mobileMenuOpen ? 0 : -1} aria-label="Close navigation" onClick={closeMobileMenu} className="ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="mb-6 px-2 sm:hidden">{themeToggle}</div>
              <div className="mb-5">{classroomNavigation(true)}</div>
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Workspace</p>
              {navigation(true)}
            </div>
            <div className="border-t border-slate-100 p-4">
              {profileLink(true)}
              <button
                type="button"
                onClick={() => { closeMobileMenu(); setLogoutPhase("confirm") }}
                className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut aria-hidden="true" className="h-[18px] w-[18px]" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {logoutPhase && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-[25rem] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,.45)]"
          >
            {logoutPhase === "success" ? (
              <div className="flex flex-col items-center px-7 py-9 text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-emerald-50 p-3 animate-[pulse_1.5s_ease-in-out_infinite]">
                  <img src={BRAND_LOGO_URL} alt="" className="h-full w-full object-contain" />
                  <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-emerald-600 text-white shadow-md">
                    <Check className="h-5 w-5 animate-in zoom-in duration-300" strokeWidth={3} />
                  </span>
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Tech Trailblazer Academy</p>
                <h2 id="logout-title" className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Signed out securely</h2>
                <p className="mt-2 text-sm text-slate-500">Your admin session has ended. Taking you to sign in…</p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4 px-6 pb-4 pt-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                    {logoutPhase === "signing-out" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                  </span>
                  <div>
                    <h2 id="logout-title" className="text-base font-semibold text-slate-900">
                      {logoutPhase === "signing-out" ? "Signing you out" : logoutPhase === "error" ? "Couldn’t sign out" : "Sign out of admin?"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-5 text-slate-500">
                      {logoutPhase === "error" ? logoutError : "You’ll need to sign in again to manage your academy workspace."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                  {logoutPhase === "error" ? (
                    <>
                      <button type="button" onClick={() => setLogoutPhase(null)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Close</button>
                      <button type="button" onClick={() => void confirmLogout()} className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800">Try again</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => setLogoutPhase(null)} disabled={logoutPhase === "signing-out"} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Stay signed in</button>
                      <button type="button" onClick={() => void confirmLogout()} disabled={logoutPhase === "signing-out"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-70">
                        {logoutPhase === "signing-out" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {logoutPhase === "signing-out" ? "Signing out…" : "Sign out"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}
