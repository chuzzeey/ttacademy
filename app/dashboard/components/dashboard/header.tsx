"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, ChevronDown, Menu, X, LayoutDashboard, Users, BarChart3, Mail, Settings, User, Sun, Moon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Email", href: "/dashboard/email", icon: Mail },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/40"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-12 transition-all duration-300">
        {/* Left Section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3" style={{ paddingTop: scrolled ? '10px' : '14px', paddingBottom: scrolled ? '10px' : '20px' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-muted/50 hover:bg-muted transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
              <span className="text-white font-bold text-[10px] sm:text-xs">TT</span>
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight hidden sm:block">
              Tech Trailblazer
            </span>
          </Link>
        </div>

        {/* Desktop/Tablet Navigation - hidden on mobile, shown on sm+ */}
        <nav className="hidden sm:flex items-center bg-card shadow-sm rounded-xl px-1 py-0.5 border border-border/60 overflow-x-auto scrollbar-none" style={{ marginTop: scrolled ? '10px' : '14px', marginBottom: scrolled ? '10px' : '20px', maxWidth: '100%' }}>
          {navItems.map((item) =>
            item.label === "Analytics" ? (
              <button
                key={item.href}
                onClick={() => alert("Analytics coming soon!")}
                className={`relative rounded-lg px-2 sm:px-2.5 lg:px-3 py-1.5 text-[10px] sm:text-[11px] lg:text-xs font-medium transition-all duration-200 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-2 sm:px-2.5 lg:px-3 py-1.5 text-[10px] sm:text-[11px] lg:text-xs font-medium transition-all duration-200 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                  isActive(item.href)
                    ? "bg-amber-500/10 text-amber-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive(item.href) && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/5 to-amber-500/10 animate-in fade-in" />
                )}
                <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-2" style={{ paddingTop: scrolled ? '10px' : '14px', paddingBottom: scrolled ? '10px' : '20px' }}>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 sm:w-9 sm:h-9 bg-muted/30 hover:bg-muted transition-colors relative"
          >
            <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-500 text-[7px] sm:text-[8px] font-bold text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
              3
            </span>
          </Button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/30 hover:bg-muted transition-colors"
            aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button id="user-menu-trigger" className="flex items-center gap-1 sm:gap-2 cursor-pointer p-1 pr-1.5 sm:pr-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-background shadow-sm">
                  <AvatarImage
                    className="object-cover"
                    src="https://res.cloudinary.com/djdbcoyot/image/upload/v1783729773/gyit83lrhi65fpfrtsrg.jpg"
                    alt="Amah Precious"
                  />
          <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-[10px] sm:text-xs font-medium">
            AP
          </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-[10px] sm:text-xs font-medium leading-tight">Amah Precious</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">Admin</p>
                </div>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-52 p-1.5 rounded-xl shadow-lg border-border/60">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium">Amah Precious</p>
                <p className="text-xs text-muted-foreground">amahchibu@gmail.com</p>
              </div>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/dashboard/profile" className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-muted/50">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/dashboard/settings" className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-muted/50">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2.5">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background/95 backdrop-blur-xl border-r border-border/60 transform transition-all duration-300 ease-out sm:hidden shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                <span className="text-white font-bold text-xs">TT</span>
              </div>
              <span className="text-base font-semibold tracking-tight">TT Academy</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User card */}
          <Link
            href="/dashboard/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 mb-5 group"
          >
            <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
              <AvatarImage
                className="object-cover"
                src="https://res.cloudinary.com/djdbcoyot/image/upload/v1783729773/gyit83lrhi65fpfrtsrg.jpg"
                alt="Amah Precious"
              />
            <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-xs">AP</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Amah Precious</p>
              <p className="text-[11px] text-muted-foreground truncate">amahchibu@gmail.com</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-[-90deg] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>

          <nav className="space-y-0.5 flex-1">
            {navItems.map((item) =>
              item.label === "Analytics" ? (
                <button
                  key={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    alert("Analytics coming soon!")
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
                    "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-muted/50">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-amber-500/10 text-amber-600 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive(item.href)
                        ? "bg-amber-500/10"
                        : "bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Bottom section */}
          <div className="pt-4 border-t border-border/40 mt-auto">
            <button className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors w-full">
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}