'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  BookOpen, Menu, X, GraduationCap,
  FileText, Bell, Search, MoreVertical,
  Code, Palette, Globe, Database, PieChart, Brain, Shield, Lock,
  MessagesSquare, UsersRound
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'

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

  const getCourseIcon = (size: string = '5') => {
    const iconMap: Record<string, React.ReactNode> = {
      'cybersecurity': <Shield className={`w-${size} h-${size} text-white`} />,
      'data-science': <Brain className={`w-${size} h-${size} text-white`} />,
      'frontend': <Code className={`w-${size} h-${size} text-white`} />,
      'backend': <Database className={`w-${size} h-${size} text-white`} />,
      'fullstack': <Globe className={`w-${size} h-${size} text-white`} />,
      'uiux': <Palette className={`w-${size} h-${size} text-white`} />,
      'graphic-design': <Palette className={`w-${size} h-${size} text-white`} />,
      'ethical-hacking': <Shield className={`w-${size} h-${size} text-white`} />,
    };
    return iconMap[courseSlug] || <GraduationCap className={`w-${size} h-${size} text-white`} />;
  }

  return (
    <div className="h-screen bg-[#111b21] flex font-sans antialiased">
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
              <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${courseData.color} flex items-center justify-center shrink-0`}>
                {getCourseIcon('5')}
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
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <button
              onClick={() => { setActiveSection('notifications'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'notifications'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>

            <button
              onClick={() => { setActiveSection('messages'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'messages'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <MessagesSquare className="w-4 h-4" />
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
              onClick={() => { setActiveSection('settings'); setSidebarOpen(false); router.push(`/classroom/${courseSlug}/dashboard/profile`) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === 'settings'
                  ? 'bg-[#2a3942] text-gray-100 font-semibold'
                  : 'text-gray-400 hover:bg-[#2a3942] hover:text-gray-200 font-medium'
              }`}
            >
              <UsersRound className="w-4 h-4" />
              Account Settings
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

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        {/* ===== HEADER ===== */}
        <header className="bg-[#202c33] border-b border-[#2a3942] px-4 py-3 flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-300 hover:text-white transition-colors rounded-lg p-2 hover:bg-[#2a3942]"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${courseData.color} flex items-center justify-center shrink-0`}>
              {getCourseIcon('5')}
            </div>
            
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-100 leading-tight truncate">
                {courseData.title}
              </h1>
              <p className="text-xs text-gray-300 leading-relaxed inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                  <div className="absolute right-0 mt-2 w-64 bg-[#1f2c33] border border-[#2a3942] rounded-xl shadow-2xl z-50 overflow-hidden">
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
                        <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2a3942] hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors">
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
                        <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors">
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
                <p className="text-[9px] text-gray-500 mt-2">
                  Important Notice: Messages in this channel are broadcast for your information and do not support replies.
                </p>
                <p className="text-[10px] text-gray-500 mt-2">
                  Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* ===== WHATSAPP-STYLE MESSAGE ===== */}
            <div className="flex justify-start px-2 mb-3">
              <div className="max-w-[calc(75%)] min-w-[240px]">
                {/* Sender row */}
                <div className="flex items-center gap-2 mb-[3px] ml-[2px]">
                  <div className={`w-[22px] h-[22px] rounded-full bg-gradient-to-br ${courseData.color} flex items-center justify-center shrink-0 shadow-md ring-2 ring-[#2a3942]/50`}>
                    {getCourseIcon('3')}
                  </div>
                  <span className="text-[13px] font-semibold text-[#00a884]">Tutor, {courseData.title}</span>
                </div>
                
                {/* Bubble */}
                <div className="bg-[#005c4b] rounded-[10px] rounded-tl-[3px] px-[11px] py-[7px] relative group shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200">
                  {/* Hover actions */}
                  <div className="absolute top-[2px] right-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="p-[3px] cursor-pointer rounded-[6px] hover:bg-[#ffffff15]">
                      <svg viewBox="0 0 10 10" className="w-[14px] h-[14px] fill-[#a0b4b9]">
                        <path d="M5 7.5a.5.5 0 01-.35-.15l-2-2a.5.5 0 11.7-.7L5 6.29l1.65-1.64a.5.5 0 11.7.7l-2 2A.5.5 0 015 7.5z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="pr-[26px]">
                    <p className="text-[14.5px] text-[#e9edef] leading-[1.45] whitespace-pre-wrap break-words select-text">
                      Hello! 👋
                    </p>
                    <p className="text-[14.5px] text-[#e9edef] leading-[1.45] mt-[7px] whitespace-pre-wrap break-words select-text">
                      Welcome to <strong className="font-bold text-[#ffffff]">{courseData.title}</strong>! I'm your instructor, <strong className="font-bold text-[#ffffff]">{courseData.instructor}</strong>.
                    </p>
                    <p className="text-[14.5px] text-[#e9edef] leading-[1.45] mt-[7px] whitespace-pre-wrap break-words select-text">
                      Excited to have you on board. Let's get started! 🚀
                    </p>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-end gap-[3px] mt-[5px]">
                    <span className="text-[11px] text-[#a0b4b9]">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
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

            {/* Bottom Spacer for Input */}
            <div className="h-20" />
          </div>
        </div>
      </div>
    </div>
  )
}