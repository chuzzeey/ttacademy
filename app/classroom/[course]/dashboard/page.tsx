'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  BookOpen, Menu, X, GraduationCap,
  FileText, Bell, Search, MoreVertical,
  Code, Palette, Globe, Database, PieChart, Brain, Shield, Lock,
  MessagesSquare, UsersRound
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  title: string
  content: string
  sender_name: string
  created_at: string
}

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)
  const dashboard = courseData.dashboard

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('messages')
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(dashboard.lessons.filter(l => l.completed).map(l => l.id))
  )
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [courseSlug])

  // Setup Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`messages:${courseSlug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `course=eq.${courseSlug}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [courseSlug])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/get?course=${courseSlug}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

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

  const currentProgress = Math.round((completedLessons.size / dashboard.lessons.length) * 100)

  // Pass the FULL class string in (not just a number) — Tailwind's JIT
  // scanner can't detect dynamically-built class names like `w-${size}`,
  // so that pattern silently produced icons with no width/height applied.
  const getCourseIcon = (sizeClass: string = 'w-5 h-5') => {
    const iconMap: Record<string, React.ReactNode> = {
      'cybersecurity': <Shield className={`${sizeClass} text-white`} />,
      'data-science': <Brain className={`${sizeClass} text-white`} />,
      'frontend': <Code className={`${sizeClass} text-white`} />,
      'backend': <Database className={`${sizeClass} text-white`} />,
      'fullstack': <Globe className={`${sizeClass} text-white`} />,
      'uiux': <Palette className={`${sizeClass} text-white`} />,
      'graphic-design': <Palette className={`${sizeClass} text-white`} />,
      'ethical-hacking': <Shield className={`${sizeClass} text-white`} />,
    };
    return iconMap[courseSlug] || <GraduationCap className={`${sizeClass} text-white`} />;
  }

  return (
    <div className="h-screen bg-[#111b21] flex font-sans antialiased overflow-hidden">
      {/* ===== SIDEBAR OVERLAY (mobile only now — sidebar is persistent from md up) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      {/* Persistent (no overlay, no toggle) from md upward. Only slides as
          an overlay drawer below md. Width scales up at lg/xl so it doesn't
          look cramped on big screens. */}
      <aside className={`fixed top-0 left-0 h-full w-72 md:w-64 lg:w-72 xl:w-80 bg-[#111b21] border-r border-[#2a3942] z-50 transform transition-transform duration-300 ease-out shadow-2xl md:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 lg:px-5 border-b border-[#2a3942] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${courseData.color} flex items-center justify-center shrink-0`}>
                {getCourseIcon('w-5 h-5')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-100 leading-tight truncate">{courseData.title}</p>
                <p className="text-[11px] text-gray-400 font-medium">Learning Hub</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-200 transition-colors rounded-md p-1 hover:bg-[#2a3942] shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-4 lg:px-5 py-4 border-b border-[#2a3942] shrink-0">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400 font-medium">Current Week</span>
              <span className="font-semibold text-[#00a884] tabular-nums">Week 1</span>
            </div>
            <div className="h-2 bg-[#0b141a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00a884] rounded-full transition-all duration-700 ease-out"
                style={{ width: '5%' }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-1">
            <button
              onClick={() => { setActiveSection('notifications'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'notifications'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              Notifications
            </button>

            <button
              onClick={() => { setActiveSection('assignments'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'assignments'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              Assignments
            </button>

            <button
              onClick={() => { setActiveSection('settings'); setSidebarOpen(false); router.push(`/classroom/${courseSlug}/dashboard/profile`) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'settings'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <UsersRound className="w-4 h-4 shrink-0" />
              Account Settings
            </button>
          </nav>

          {/* Sidebar footer: profile */}
          <div className="p-3 lg:p-4 border-t border-[#2a3942] shrink-0">
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

      {/* ===== MAIN CONTENT AREA ===== */}
      {/* Offset matches the sidebar's own width at each breakpoint exactly:
          md:w-64 -> md:ml-64, lg:w-72 -> lg:ml-72, xl:w-80 -> xl:ml-80 */}
      <div className="flex-1 flex flex-col md:ml-64 lg:ml-72 xl:ml-80 w-full min-w-0 h-full">
        {/* ===== HEADER ===== */}
        <header className="bg-[#202c33] border-b border-[#2a3942] px-4 md:px-5 lg:px-6 xl:px-8 py-3 md:py-3 lg:py-3.5 flex items-center justify-between z-30 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden shrink-0 text-gray-300 hover:text-white transition-colors rounded-lg p-2 hover:bg-[#2a3942]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${courseData.color} flex items-center justify-center shrink-0`}>
              {getCourseIcon('w-5 h-5')}
            </div>

            <div className="min-w-0">
              <h1 className="text-sm lg:text-[15px] font-semibold text-gray-100 leading-tight truncate">
                {courseData.title}
              </h1>
              <p className="text-xs text-gray-300 leading-relaxed inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="w-9 h-9 rounded-lg hover:bg-[#2a3942] flex items-center justify-center text-gray-300 hover:text-white transition-all">
              <Search className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-9 h-9 rounded-lg hover:bg-[#2a3942] flex items-center justify-center text-gray-300 hover:text-white transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showProfileDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20"
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 md:w-72 bg-[#1f2c33] border border-[#2a3942] rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-4 border-b border-[#2a3942] bg-[#111b21]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800 ring-2 ring-[#00a884] flex items-center justify-center shrink-0">
                          <Image
                            src={dashboard.profile.avatar}
                            alt={dashboard.profile.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-100 truncate">{dashboard.profile.name}</p>
                          <p className="text-xs text-gray-400 truncate">{dashboard.profile.email}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#00a884] mt-0.5">
                            <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full"></span>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <button
                        onClick={() => { setShowProfileDropdown(false); router.push(`/classroom/${courseSlug}/dashboard/profile`) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2a3942] hover:text-white transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2a3942] hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        Help & Support
                      </button>
                    </div>

                    {/* Divider & Logout */}
                    <div className="border-t border-[#2a3942]">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[#2a3942] hover:text-red-300 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ===== MAIN CHAT AREA ===== */}
        <div className="flex-1 overflow-y-auto bg-[#0b141a] bg-opacity-30 scrollbar-hide" style={{
          backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}>
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto p-4 md:p-5 lg:p-6 xl:p-8 space-y-4">
            {/* Welcome Message */}
            <div className="flex justify-center my-6">
              <div className="bg-[#1c2b33] rounded-lg px-4 py-3 text-center max-w-md lg:max-w-lg shadow-lg">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {dashboard.welcomeMessage}
                </p>
                <p className="text-[9px] text-gray-500 mt-2">
                  Important Notice: Messages in this channel are broadcast for your information and do not support replies.
                </p>
                <p className="text-[10px] text-gray-500 mt-2">
                  Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* ===== DYNAMIC MESSAGES FROM DATABASE ===== */}
            {!loadingMessages && messages.map((msg, index) => (
              <div key={msg.id} className="flex justify-start px-2 mb-3">
                <div className="max-w-[calc(75%)] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[55%] min-w-[240px]">
                  {/* Sender row */}
                  <div className="flex items-center gap-2 mb-[3px] ml-[2px]">
                    <div className={`w-[22px] h-[22px] rounded-full bg-gradient-to-br ${courseData.color} flex items-center justify-center shrink-0 shadow-md ring-2 ring-[#2a3942]/50`}>
                      <span className="text-white text-xs font-bold">{msg.sender_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#00a884]">{msg.sender_name}</span>
                  </div>

                  {/* Bubble */}
                  <div className="bg-[#005c4b] rounded-[10px] rounded-tl-[3px] px-[11px] py-[7px] relative group shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200">
                    {/* Title */}
                    <div className="pr-[26px]">
                      <p className="text-[14.5px] text-[#ffffff] leading-[1.45] whitespace-pre-wrap break-words select-text font-semibold">
                        {msg.title}
                      </p>
                    </div>

                    {/* Text content */}
                    <div className="pr-[26px] mt-[7px]">
                      <p className="text-[14.5px] text-[#e9edef] leading-[1.45] whitespace-pre-wrap break-words select-text">
                        {msg.content}
                      </p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-end gap-[3px] mt-[5px]">
                      <span className="text-[11px] text-[#a0b4b9]">
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      <svg viewBox="0 0 16 11" className="w-[16px] h-[11px]">
                        <path d="M2 5.5L4.5 8L9 3.5" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 5.5L8.5 8L13 3.5" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Tail */}
                    <div className="absolute -left-[7px] top-[12px] w-[10px] h-[10px] overflow-hidden">
                      <div className="absolute left-0 top-0 w-[14px] h-[14px] bg-[#005c4b] rounded-[2px]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Spacer for Input */}
            <div className="h-20" />
          </div>
        </div>
      </div>
    </div>
  )
}