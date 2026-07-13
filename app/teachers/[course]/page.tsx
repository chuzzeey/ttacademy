'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield, BarChart3, Cpu, Globe, ShieldAlert, Palette, Code, Monitor, Server, Globe2, TrendingUp, Cloud, Database, ArrowLeft, Send, AlertCircle, CheckCircle2, MessageSquare, Bell, Menu, X, GraduationCap, LogOut, Home, BookMarked, User, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const courseSlugMap: Record<string, string> = {
  'cybersecurity': 'cybersecurity',
  'data-science': 'data-science',
  'ai-automation': 'ai-automation',
  'computer-networking': 'computer-networking',
  'ethical-hacking': 'ethical-hacking',
  'graphic-design': 'graphic-design',
  'uiux-design': 'uiux-design',
  'full-stack-development': 'full-stack-development',
  'frontend-development': 'frontend-development',
  'backend-development': 'backend-development',
  'web-development': 'web-development',
  'digital-marketing': 'digital-marketing',
  'cloud-computing': 'cloud-computing',
  'data-analysis': 'data-analysis',
}

const courseData: Record<string, {
  title: string
  icon: any
  color: string
  gradient: string
  lightBg: string
  iconBg: string
  iconColor: string
  borderColor: string
  accent: string
}> = {
  'cybersecurity': { title: 'Cybersecurity', icon: Shield, color: 'from-red-600 to-red-800', gradient: 'from-red-500/20 via-red-600/10 to-red-800/20', lightBg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', borderColor: 'border-red-200', accent: 'red' },
  'data-science': { title: 'Data Science', icon: BarChart3, color: 'from-emerald-600 to-emerald-800', gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-800/20', lightBg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200', accent: 'emerald' },
  'ai-automation': { title: 'AI Automation', icon: Cpu, color: 'from-amber-600 to-amber-800', gradient: 'from-amber-500/20 via-amber-600/10 to-amber-800/20', lightBg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', borderColor: 'border-amber-200', accent: 'amber' },
  'computer-networking': { title: 'Computer Networking', icon: Globe, color: 'from-cyan-600 to-cyan-800', gradient: 'from-cyan-500/20 via-cyan-600/10 to-cyan-800/20', lightBg: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', borderColor: 'border-cyan-200', accent: 'cyan' },
  'ethical-hacking': { title: 'Ethical Hacking', icon: ShieldAlert, color: 'from-rose-600 to-rose-800', gradient: 'from-rose-500/20 via-rose-600/10 to-rose-800/20', lightBg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', borderColor: 'border-rose-200', accent: 'rose' },
  'graphic-design': { title: 'Graphic Design', icon: Palette, color: 'from-pink-600 to-pink-800', gradient: 'from-pink-500/20 via-pink-600/10 to-pink-800/20', lightBg: 'bg-pink-50', iconBg: 'bg-pink-100', iconColor: 'text-pink-600', borderColor: 'border-pink-200', accent: 'pink' },
  'uiux-design': { title: 'UI/UX Design', icon: Palette, color: 'from-purple-600 to-purple-800', gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/20', lightBg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', borderColor: 'border-purple-200', accent: 'purple' },
  'full-stack-development': { title: 'Full Stack Development', icon: Code, color: 'from-blue-600 to-blue-800', gradient: 'from-blue-500/20 via-blue-600/10 to-blue-800/20', lightBg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', borderColor: 'border-blue-200', accent: 'blue' },
  'frontend-development': { title: 'Frontend Development', icon: Monitor, color: 'from-sky-600 to-sky-800', gradient: 'from-sky-500/20 via-sky-600/10 to-sky-800/20', lightBg: 'bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', borderColor: 'border-sky-200', accent: 'sky' },
  'backend-development': { title: 'Backend Development', icon: Server, color: 'from-indigo-600 to-indigo-800', gradient: 'from-indigo-500/20 via-indigo-600/10 to-indigo-800/20', lightBg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200', accent: 'indigo' },
  'web-development': { title: 'Web Development', icon: Globe2, color: 'from-teal-600 to-teal-800', gradient: 'from-teal-500/20 via-teal-600/10 to-teal-800/20', lightBg: 'bg-teal-50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', borderColor: 'border-teal-200', accent: 'teal' },
  'digital-marketing': { title: 'Digital Marketing', icon: TrendingUp, color: 'from-orange-600 to-orange-800', gradient: 'from-orange-500/20 via-orange-600/10 to-orange-800/20', lightBg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', borderColor: 'border-orange-200', accent: 'orange' },
  'cloud-computing': { title: 'Cloud Computing', icon: Cloud, color: 'from-violet-600 to-violet-800', gradient: 'from-violet-500/20 via-violet-600/10 to-violet-800/20', lightBg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', borderColor: 'border-violet-200', accent: 'violet' },
  'data-analysis': { title: 'Data Analysis', icon: Database, color: 'from-lime-600 to-lime-800', gradient: 'from-lime-500/20 via-lime-600/10 to-lime-800/20', lightBg: 'bg-lime-50', iconBg: 'bg-lime-100', iconColor: 'text-lime-600', borderColor: 'border-lime-200', accent: 'lime' },
}

export default function TeacherCoursePage() {
  const params = useParams()
  const router = useRouter()
  const course = courseData[params.course as string]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [messageTitle, setMessageTitle] = useState('')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentMessages, setSentMessages] = useState<{ title: string; content: string; timestamp: Date }[]>([])

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">The course you are looking for does not exist.</p>
          <button onClick={() => router.push('/teachers')} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </main>
    )
  }

  const Icon = course.icon

  const handleSendMessage = async () => {
    if (!messageTitle.trim()) {
      setError('Please enter a message title.')
      return
    }
    if (!message.trim()) {
      setError('Please write a message to send.')
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: messageTitle,
          content: message,
          course: params.course,
          sender_name: 'Mentor',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
        setIsSending(false)
        return
      }

      setError('')
      setShowSuccess(true)
      setMessageTitle('')
      setMessage('')
      setSentMessages([...sentMessages, { title: messageTitle, content: message, timestamp: new Date() }])
      setIsSending(false)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError('Failed to send message. Please try again.')
      setIsSending(false)
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookMarked },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <main
      className="min-h-screen font-sans"
      style={{
        fontFamily: 'var(--font-noto-sans)',
        backgroundColor: '#ECE5DD',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {/* Top Navigation Bar - WhatsApp Teal */}
      <header className="sticky top-0 z-50 bg-[#008069] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Course Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white">{course.title}</p>
                <p className="text-xs text-white/70">Mentor Dashboard</p>
              </div>
            </div>
          
            {/* Centered Navigation - Desktop */}
            <nav className="hidden md:flex items-center justify-center gap-1">
              {navItems.map((item) => {
                const NavIcon = item.icon
                return (
                  <button
                    key={item.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <NavIcon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="hidden sm:flex p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5 text-white/80" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                M
              </div>
              <button onClick={() => router.push('/teachers')} className="hidden lg:inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-[#008069]"
            >
              <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const NavIcon = item.icon
                    return (
                      <button
                        key={item.id}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all duration-200"
                      >
                        <NavIcon className="w-5 h-5 text-white/70" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 transition-all duration-200">
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content - WhatsApp Chat Style */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4">
          {/* Send Announcement - WhatsApp style white card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-4 sm:p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#008069]/10 text-[#008069]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#111B21]">Send Announcement</h2>
                <p className="text-xs text-[#667781]">Send a message to all {course.title} students</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-[#111B21] mb-1.5">Message Title</label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => { setMessageTitle(e.target.value); setError('') }}
                placeholder="e.g., Assignment Reminder..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#008069]/30 text-[#111B21] placeholder-[#667781] transition-all text-sm"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-[#111B21] mb-1.5">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError('') }}
                placeholder="Write your announcement here..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#008069]/30 text-[#111B21] placeholder-[#667781] transition-all text-sm resize-none"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-[#D9FDD3] border border-[#008069]/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#008069] shrink-0" />
                  <p className="text-sm text-[#111B21] font-medium">Announcement sent!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSendMessage}
              disabled={isSending}
              className="w-full py-2.5 sm:py-3 px-6 rounded-lg bg-[#008069] text-white font-bold text-sm sm:text-base hover:bg-[#017561] transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send to All Students
                </>
              )}
            </button>
          </motion.div>

        {/* WhatsApp-style Chat UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg overflow-hidden border border-black/5 shadow-sm"
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#008069] text-white">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{course.title} Students</p>
              <p className="text-xs text-white/70">Announcement channel</p>
            </div>
            <MessageSquare className="w-5 h-5 text-white/80" />
          </div>

          {/* Chat Body - WhatsApp background (transparent to show page bg) */}
          <div
            className="p-4 space-y-2 max-h-[28rem] overflow-y-auto"
            style={{
              backgroundColor: 'transparent',
            }}
          >
            {/* Incoming system tips (left, white bubbles) */}
            {[
              'Use announcements for important updates',
              'Share Zoom links for live sessions',
              'Include deadlines in your messages',
              'Keep a supportive and encouraging tone',
            ].map((tip, i) => (
              <div key={`tip-${i}`} className="flex justify-start">
                <div className="relative max-w-[85%] bg-white rounded-lg px-3 py-2 shadow-sm" style={{ borderTopLeftRadius: 0 }}>
                  <p className="text-xs sm:text-sm text-[#111B21]">{tip}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#667781]">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Outgoing sent messages (right, WhatsApp green bubbles) */}
            {sentMessages.map((msg, index) => (
              <div
                key={index}
                onContextMenu={(e) => {
                  e.preventDefault()
                  if (confirm('Delete this message?')) {
                    setSentMessages(sentMessages.filter((_, i) => i !== index))
                  }
                }}
                onTouchStart={(e) => {
                  const timer = setTimeout(() => {
                    if (confirm('Delete this message?')) {
                      setSentMessages(sentMessages.filter((_, i) => i !== index))
                    }
                  }, 800)
                  e.currentTarget.dataset.timer = timer.toString()
                }}
                onTouchEnd={(e) => {
                  const timer = e.currentTarget.dataset.timer
                  if (timer) clearTimeout(parseInt(timer))
                }}
                className="flex justify-end group"
              >
                <div
                  className="relative max-w-[85%] rounded-lg px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#D9FDD3', borderTopRightRadius: 0 }}
                >
                  <h4 className="font-semibold text-xs sm:text-sm text-[#111B21] mb-0.5 break-words">{msg.title}</h4>
                  <p className="text-xs sm:text-sm text-[#111B21] break-words whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#667781]">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Blue double check = read */}
                    <svg className="w-3.5 h-3.5 text-[#53BDEB]" viewBox="0 0 18 18" fill="currentColor">
                      <path d="M1.5 9.5l3.5 3.5 7-7M8 13l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this message?')) {
                        setSentMessages(sentMessages.filter((_, i) => i !== index))
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {sentMessages.length === 0 && (
              <div className="flex justify-center py-6">
                <p className="text-xs text-[#667781] bg-white/60 rounded-full px-3 py-1">
                  No announcements sent yet
                </p>
              </div>
            )}
          </div>
        </motion.div>
        </div>
      </div>
    </main>
  )
}
