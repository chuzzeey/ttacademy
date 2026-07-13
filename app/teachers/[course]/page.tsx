'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield, BarChart3, Cpu, Globe, ShieldAlert, Palette, Code, Monitor, Server, Globe2, TrendingUp, Cloud, Database, ArrowLeft, Send, AlertCircle, CheckCircle2, MessageSquare, Bell, Link, ExternalLink, Copy, Menu, X, GraduationCap, LogOut, Home, BookMarked, User, Settings } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [messageTitle, setMessageTitle] = useState('')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkSuccess, setLinkSuccess] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [links, setLinks] = useState<{ title: string; url: string }[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The course you are looking for does not exist.</p>
          <button onClick={() => router.push('/teachers')} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
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
        return
      }

      setError('')
      setShowSuccess(true)
      setMessageTitle('')
      setMessage('')
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError('Failed to send message. Please try again.')
    }
  }

  const handleAddLink = () => {
    if (!linkTitle.trim()) {
      setLinkError('Please enter a link title.')
      return
    }
    if (!linkUrl.trim()) {
      setLinkError('Please paste a link.')
      return
    }
    setLinkError('')
    setLinks([...links, { title: linkTitle, url: linkUrl }])
    setLinkSuccess(true)
    setTimeout(() => {
      setLinkSuccess(false)
      setLinkTitle('')
      setLinkUrl('')
    }, 2000)
  }

  const handleCopyLink = (index: number) => {
    navigator.clipboard.writeText(links[index].url)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookMarked },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <main className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'var(--font-noto-sans)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${course.iconBg} ${course.iconColor}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{course.title}</p>
              <p className="text-xs text-gray-400">Mentor Dashboard</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <div>
              <p className="font-semibold text-gray-900">Mentor</p>
              <p className="text-xs text-gray-400">{course.title} Teacher</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const NavIcon = item.icon
            return (
              <button key={item.id} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200">
                <NavIcon className="w-5 h-5 text-gray-400" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => router.push('/teachers')} className="hidden sm:inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  M
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${course.gradient}`}>
          <div className="relative max-w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${course.iconBg} ${course.iconColor} shadow-lg shrink-0`}>
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">Welcome, Mentor</h1>
                <p className="mt-1 text-gray-600 text-base sm:text-lg">You are the teacher for {course.title}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Send Message */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`bg-white rounded-2xl border ${course.borderColor} p-5 sm:p-8 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className={`p-2.5 rounded-lg ${course.iconBg} ${course.iconColor}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Send Announcement</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Send a message to all {course.title} students</p>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Title</label>
                <input type="text" value={messageTitle} onChange={(e) => { setMessageTitle(e.target.value); setError('') }}
                  placeholder="e.g., Assignment Reminder..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 placeholder-gray-400 transition-all text-sm" />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                <textarea value={message} onChange={(e) => { setMessage(e.target.value); setError('') }}
                  placeholder="Write your announcement here..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 placeholder-gray-400 transition-all text-sm resize-none" />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <AnimatePresence>
                {showSuccess && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-600 font-medium">Announcement sent!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleSendMessage} className={`w-full py-3 sm:py-4 px-6 rounded-xl bg-gradient-to-r ${course.color} text-white font-bold text-sm sm:text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-[0.98]`}>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                Send to All Students
              </button>
            </motion.div>

            {/* Share Links */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`bg-white rounded-2xl border ${course.borderColor} p-5 sm:p-8 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className={`p-2.5 rounded-lg ${course.iconBg} ${course.iconColor}`}>
                  <Link className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Share Resources</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Paste links for your students to access</p>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link Title</label>
                <input type="text" value={linkTitle} onChange={(e) => { setLinkTitle(e.target.value); setLinkError('') }}
                  placeholder="e.g., Join Zoom Call Now..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 placeholder-gray-400 transition-all text-sm" />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Link</label>
                <input type="url" value={linkUrl} onChange={(e) => { setLinkUrl(e.target.value); setLinkError('') }}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 placeholder-gray-400 transition-all text-sm" />
              </div>

              {linkError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{linkError}</p>
                </motion.div>
              )}

              <AnimatePresence>
                {linkSuccess && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-600 font-medium">Link added!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleAddLink} className={`w-full py-3 sm:py-4 px-6 rounded-xl bg-gradient-to-r ${course.color} text-white font-bold text-sm sm:text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-[0.98]`}>
                <Link className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Link
              </button>

              {links.length > 0 && (
                <div className="mt-5 sm:mt-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    Shared Links ({links.length})
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {links.map((link, index) => (
                      <div key={index} className={`p-3 rounded-xl bg-gradient-to-br ${course.gradient} border ${course.borderColor} flex items-center justify-between gap-2`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{link.title}</p>
                          <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        </div>
                        <button onClick={() => handleCopyLink(index)} className="p-2 rounded-lg bg-white/80 hover:bg-white transition-colors shrink-0">
                          {copiedIndex === index ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Tips */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`mt-6 sm:mt-8 bg-white rounded-2xl border ${course.borderColor} p-5 sm:p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Bell className={`w-5 h-5 ${course.iconColor}`} />
              <h3 className="font-bold text-gray-900">Mentor Tips</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex gap-2 items-start">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-gradient-to-r ${course.color}`} />
                Use announcements for important updates
              </div>
              <div className="flex gap-2 items-start">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-gradient-to-r ${course.color}`} />
                Share Zoom links for live sessions
              </div>
              <div className="flex gap-2 items-start">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-gradient-to-r ${course.color}`} />
                Include deadlines in your messages
              </div>
              <div className="flex gap-2 items-start">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-gradient-to-r ${course.color}`} />
                Keep a supportive and encouraging tone
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}