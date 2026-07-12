'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
  BookOpen, Menu, X, Home, GraduationCap,
  FileText, Calendar, Bell, CheckCircle2, Circle,
  ArrowRight, Mail, CalendarDays, ChevronDown, ChevronRight,
  Clock, Trophy, Target, Play, CheckCheck, Sparkles,
  Send, Search, MoreVertical, Phone, Video, Info,
  Code, Palette, Globe, Database, PieChart, Brain, Shield, Lock, Activity
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'

export default function DashboardPage() {
  const params = useParams()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)
  const dashboard = courseData.dashboard

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('messages')
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(dashboard.lessons.filter(l => l.completed).map(l => l.id))
  )
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]))
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleLesson = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev)
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId)
      } else {
        newSet.add(lessonId)
      }
      return newSet
    })
  }

  const toggleWeek = (weekIndex: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(weekIndex)) {
        newSet.delete(weekIndex)
      } else {
        newSet.add(weekIndex)
      }
      return newSet
    })
  }

  const currentProgress = Math.round((completedLessons.size / dashboard.lessons.length) * 100)

  // Distribute lessons evenly across roadmap weeks
  const weeklyLessons = courseData.roadmap.map((week, weekIndex) => {
    const lessonsPerWeek = Math.ceil(dashboard.lessons.length / courseData.roadmap.length)
    const start = weekIndex * lessonsPerWeek
    const end = start + lessonsPerWeek
    const weekLessons = dashboard.lessons.slice(start, end)
    return { week, weekIndex, lessons: weekLessons }
  })

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'HTML': <Code className="w-4 h-4" />,
      'CSS': <Palette className="w-4 h-4" />,
      'JavaScript': <FileText className="w-4 h-4" />,
      'React': <Code className="w-4 h-4" />,
      'Next.js': <Globe className="w-4 h-4" />,
      'Backend': <Database className="w-4 h-4" />,
      'Projects': <BookOpen className="w-4 h-4" />,
      'Python': <Code className="w-4 h-4" />,
      'Statistics': <PieChart className="w-4 h-4" />,
      'Machine Learning': <Brain className="w-4 h-4" />,
      'Pandas': <Database className="w-4 h-4" />,
      'SQL': <Database className="w-4 h-4" />,
      'Visualization': <PieChart className="w-4 h-4" />,
      'Foundations': <BookOpen className="w-4 h-4" />,
      'PenTesting': <Shield className="w-4 h-4" />,
      'Cryptography': <Lock className="w-4 h-4" />,
    }
    return icons[category] || <BookOpen className="w-4 h-4" />
  }

  return (
    <div className="h-screen bg-[#111b21] flex flex-col font-sans antialiased">
      {/* ===== HEADER ===== */}
      <header className="bg-[#202c33] border-b border-[#2a3942] px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-300 hover:text-white transition-colors rounded-lg p-2 hover:bg-[#2a3942]"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-100 leading-tight truncate">
              {courseData.title}
            </h1>
            <p className="text-[8px] text-gray-400 mt-0.5 leading-relaxed">
              Important Notice: Messages in this channel are broadcast for your information and do not support replies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg hover:bg-[#2a3942] flex items-center justify-center text-gray-300 hover:text-white transition-all">
            <Search className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-[#2a3942] flex items-center justify-center text-gray-300 hover:text-white transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 overflow-y-auto bg-[#0b141a] bg-opacity-30" style={{
        backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '400px'
      }}>
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Welcome Message */}
          <div className="flex justify-center my-6">
            <div className="bg-[#1c2b33] rounded-lg px-4 py-3 text-center max-w-md shadow-lg">
              <p className="text-xs text-gray-300 leading-relaxed">
                {dashboard.welcomeMessage}
              </p>
              <p className="text-[10px] text-gray-400 mt-2">
                {courseData.description}
              </p>
              <p className="text-[10px] text-gray-500 mt-2">
                Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Bottom Spacer for Input */}
          <div className="h-20" />
        </div>
      </div>

      {/* ===== MESSAGE INPUT ===== */}
      <div className="bg-[#202c33] border-t border-[#2a3942] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button className="w-9 h-9 rounded-full hover:bg-[#2a3942] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all shrink-0">
            <Send className="w-5 h-5 rotate-90" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-[#2a3942] text-gray-200 text-sm rounded-full px-4 py-2.5 pr-10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a884] transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-[#3a4a52] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>

          <button className="w-9 h-9 rounded-full hover:bg-[#2a3942] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all shrink-0">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== SIDEBAR OVERLAY (mobile) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#111b21] border-r border-[#2a3942] z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#2a3942]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-100 leading-tight truncate">{courseData.title}</p>
                <p className="text-[11px] text-gray-400 font-medium">Learning Hub</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-200 transition-colors rounded-md p-1 hover:bg-[#2a3942]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-4 py-4 border-b border-[#2a3942]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400 font-medium">Your Progress</span>
              <span className="font-semibold text-[#00a884] tabular-nums">{currentProgress}%</span>
            </div>
            <div className="h-2 bg-[#0b141a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00a884] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <button
              onClick={() => { setActiveSection('messages'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'messages'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <Home className="w-4 h-4" />
              Messages
            </button>

            <button
              onClick={() => { setActiveSection('assignments'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'assignments'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <FileText className="w-4 h-4" />
              Assignments
            </button>

            <button
              onClick={() => { setActiveSection('announcements'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'announcements'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <Bell className="w-4 h-4" />
              Announcements
            </button>

            <button
              onClick={() => { setActiveSection('activity'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'activity'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <Activity className="w-4 h-4" />
              Recent Activity
            </button>
          </nav>

          {/* Sidebar footer: profile */}
          <div className="p-3 border-t border-[#2a3942]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a3942] transition-colors duration-200 cursor-pointer group">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 ring-2 ring-[#2a3942] shrink-0">
                <Image
                  src={dashboard.profile.avatar}
                  alt={dashboard.profile.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{dashboard.profile.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{dashboard.profile.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}