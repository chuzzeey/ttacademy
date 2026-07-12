'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  BookOpen, Calendar, CheckCircle2, Clock, FileText, GraduationCap,
  Megaphone, MessageSquare, PlayCircle, Award, Bell, Search, Menu, X,
  User, Settings, LogOut, ChevronRight, Home, BookMarked, BarChart3,
  TrendingUp, Users, Star, ArrowRight, AlertCircle, Download,
  Filter, Grid3X3, List, ChevronLeft, ChevronDown, ExternalLink,
  Video, File, PenTool, Briefcase, Zap, Target, Activity, Lock as LockIcon
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────
interface Course {
  id: string
  title: string
  image: string
  progress: number
  totalWeeks: number
  currentWeek: number
  nextLesson: string
  nextLessonDate: string
  color: string
  gradient: string
  iconBg: string
  iconColor: string
  borderColor: string
  instructor: string
  grade: string
}

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded' | 'overdue'
  grade?: string
  courseColor: string
}

interface Announcement {
  id: string
  title: string
  content: string
  course: string
  date: string
  author: string
  courseColor: string
  iconBg: string
  iconColor: string
}

interface Activity {
  id: string
  type: 'lesson' | 'assignment' | 'achievement' | 'quiz'
  description: string
  course: string
  time: string
  icon: any
  color: string
}

// ─── Mock Data ───────────────────────────────────────────────────────
const enrolledCourses: Course[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    image: '/cybersecurity_course.jpeg',
    progress: 35,
    totalWeeks: 6,
    currentWeek: 3,
    nextLesson: 'Network Security Protocols',
    nextLessonDate: '2026-07-14',
    color: 'from-red-600 to-red-800',
    gradient: 'from-red-500/20 via-red-600/10 to-red-800/20',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    instructor: 'Dr. Michael Okonkwo',
    grade: 'A'
  },
  {
    id: 'data-science',
    title: 'Data Science',
    image: '/data_science_course.jpeg',
    progress: 60,
    totalWeeks: 6,
    currentWeek: 4,
    nextLesson: 'Machine Learning Algorithms',
    nextLessonDate: '2026-07-15',
    color: 'from-emerald-600 to-emerald-800',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-800/20',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    instructor: 'Prof. Sarah Adeyemi',
    grade: 'A+'
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    image: '/fullstack_course.jpeg',
    progress: 15,
    totalWeeks: 6,
    currentWeek: 1,
    nextLesson: 'React Components & Hooks',
    nextLessonDate: '2026-07-16',
    color: 'from-blue-600 to-blue-800',
    gradient: 'from-blue-500/20 via-blue-600/10 to-blue-800/20',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    instructor: 'Engr. Chidi Eze',
    grade: 'B+'
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Design',
    image: '/uiux_course.jpeg',
    progress: 80,
    totalWeeks: 6,
    currentWeek: 5,
    nextLesson: 'Design Systems & Prototyping',
    nextLessonDate: '2026-07-13',
    color: 'from-purple-600 to-purple-800',
    gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/20',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    instructor: 'Ms. Grace Bello',
    grade: 'A'
  }
]

const assignments: Assignment[] = [
  { id: 'a1', title: 'Network Security Analysis Report', course: 'Cybersecurity', dueDate: '2026-07-18', status: 'pending', courseColor: 'red' },
  { id: 'a2', title: 'Data Cleaning & Visualization', course: 'Data Science', dueDate: '2026-07-20', status: 'pending', courseColor: 'emerald' },
  { id: 'a3', title: 'Build a Todo App with React', course: 'Full Stack Development', dueDate: '2026-07-22', status: 'pending', courseColor: 'blue' },
  { id: 'a4', title: 'Figma Wireframe Project', course: 'UI/UX Design', dueDate: '2026-07-14', status: 'submitted', grade: '92%', courseColor: 'purple' },
  { id: 'a5', title: 'Penetration Testing Report', course: 'Cybersecurity', dueDate: '2026-07-10', status: 'graded', grade: '88%', courseColor: 'red' },
  { id: 'a6', title: 'Statistical Analysis Project', course: 'Data Science', dueDate: '2026-07-08', status: 'graded', grade: '95%', courseColor: 'emerald' },
]

const announcements: Announcement[] = [
  {
    id: 'ann1',
    title: 'Mid-Semester Break Schedule',
    content: 'Please note that there will be a mid-semester break from July 24th to July 28th. All classes will resume on July 29th.',
    course: 'All Courses',
    date: '2 hours ago',
    author: 'Academic Office',
    courseColor: 'red',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    id: 'ann2',
    title: 'Guest Lecture: AI in Cybersecurity',
    content: 'We are hosting a special guest lecture by Dr. James Wilson from MIT on "The Future of AI in Cybersecurity" this Friday at 3 PM.',
    course: 'Cybersecurity',
    date: '1 day ago',
    author: 'Dr. Michael Okonkwo',
    courseColor: 'red',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    id: 'ann3',
    title: 'Data Science Hackathon',
    content: 'Registration is open for the annual Data Science Hackathon. Teams of 3-4 members. Prize pool of ₦500,000!',
    course: 'Data Science',
    date: '3 days ago',
    author: 'Prof. Sarah Adeyemi',
    courseColor: 'emerald',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  }
]

const recentActivities: Activity[] = [
  { id: 'act1', type: 'lesson', description: 'Completed "Network Protocols & TCP/IP"', course: 'Cybersecurity', time: '2 hours ago', icon: PlayCircle, color: 'text-red-500' },
  { id: 'act2', type: 'assignment', description: 'Submitted "Figma Wireframe Project"', course: 'UI/UX Design', time: '5 hours ago', icon: FileText, color: 'text-purple-500' },
  { id: 'act3', type: 'achievement', description: 'Earned "Quick Learner" badge', course: 'Data Science', time: '1 day ago', icon: Award, color: 'text-amber-500' },
  { id: 'act4', type: 'quiz', description: 'Scored 95% on Week 3 Quiz', course: 'Cybersecurity', time: '2 days ago', icon: Target, color: 'text-red-500' },
  { id: 'act5', type: 'lesson', description: 'Started "React Hooks & State Management"', course: 'Full Stack Development', time: '3 days ago', icon: PlayCircle, color: 'text-blue-500' },
  { id: 'act6', type: 'achievement', description: 'Completed 80% of UI/UX Design course', course: 'UI/UX Design', time: '4 days ago', icon: Star, color: 'text-purple-500' },
]

// ─── Helper ──────────────────────────────────────────────────────────
const getDaysUntil = (dateStr: string) => {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 0) return `${Math.abs(diff)} days overdue`
  return `${diff} days left`
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    submitted: 'bg-blue-50 text-blue-600 border-blue-200',
    graded: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    overdue: 'bg-red-50 text-red-600 border-red-200'
  }
  return styles[status] || styles.pending
}

// ─── Component ───────────────────────────────────────────────────────
export default function ClassroomDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [showAllAssignments, setShowAllAssignments] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookMarked },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const totalProgress = Math.round(
    enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length
  )

  const pendingAssignments = assignments.filter(a => a.status === 'pending').length
  const upcomingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'submitted').slice(0, showAllAssignments ? assignments.length : 3)

  return (
    <main className="min-h-screen bg-gray-50/80">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="shrink-0 flex items-center gap-3 px-5 h-16 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">TT Academy</p>
            <p className="text-[11px] text-gray-400 tracking-wide">Student Dashboard</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="shrink-0 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-base shrink-0">
              E
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">Enoch</p>
              <p className="text-[11px] text-gray-400 truncate">enoch@ttacademy.edu</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-200 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${activeTab === item.id ? 'text-red-500' : 'text-gray-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="shrink-0 p-3 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200">
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-gray-900">Classroom Dashboard</h1>
                <p className="text-xs text-gray-400">{currentTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                  E
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Enoch</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">
          {/* ─── OVERVIEW TAB ────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-2xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold">
                        {greeting}, Enoch! 👋
                      </h1>
                      <p className="mt-1.5 text-white/80 text-sm sm:text-base">
                        You're enrolled in <strong>{enrolledCourses.length} courses</strong> with an overall progress of <strong>{totalProgress}%</strong>. Keep pushing forward!
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex flex-wrap gap-3">
                    <button onClick={() => { setActiveTab('courses'); setViewMode('grid') }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">
                      <PlayCircle className="w-4 h-4" />
                      Continue Learning
                    </button>
                    <button onClick={() => setActiveTab('assignments')} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/20">
                      <FileText className="w-4 h-4" />
                      View Assignments
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Enrolled Courses', value: enrolledCourses.length.toString(), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Completed Lessons', value: '24', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Pending Tasks', value: pendingAssignments.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Avg. Grade', value: '91%', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* Courses & Upcoming */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* My Courses Preview */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
                    <button onClick={() => setActiveTab('courses')} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                      View All <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enrolledCourses.slice(0, 2).map((course) => (
                      <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                        onClick={() => router.push(`/classroom/${course.id}`)}>
                        <div className="relative h-28 sm:h-32">
                          <Image src={course.image} alt={course.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2 left-3 right-3">
                            <h3 className="text-white font-bold text-sm truncate">{course.title}</h3>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${course.color} transition-all duration-500`} style={{ width: `${course.progress}%` }} />
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Week {course.currentWeek}/{course.totalWeeks}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Assignments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Upcoming</h2>
                    <button onClick={() => setActiveTab('assignments')} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                      All <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {upcomingAssignments.map((a) => (
                      <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            a.courseColor === 'red' ? 'bg-red-50 text-red-500' :
                            a.courseColor === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                            a.courseColor === 'blue' ? 'bg-blue-50 text-blue-500' :
                            'bg-purple-50 text-purple-500'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{a.course}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(a.status)}`}>
                                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                              </span>
                              <span className="text-[10px] text-gray-400">{getDaysUntil(a.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity & Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <h3 className="font-bold text-gray-900 text-sm">Recent Activity</h3>
                    </div>
                    <button className="text-xs font-semibold text-red-500 hover:text-red-600">View All</button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {recentActivities.map((act) => {
                      const Icon = act.icon
                      return (
                        <div key={act.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                          <div className={`p-1.5 rounded-lg bg-gray-50 ${act.color} shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">{act.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">{act.course}</span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-xs text-gray-400">{act.time}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Announcements */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-gray-500" />
                      <h3 className="font-bold text-gray-900 text-sm">Announcements</h3>
                    </div>
                    <button className="text-xs font-semibold text-red-500 hover:text-red-600">View All</button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${ann.iconBg} ${ann.iconColor} shrink-0`}>
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900">{ann.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{ann.content}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-gray-400">{ann.author}</span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400">{ann.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── COURSES TAB ─────────────────────────────────────── */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                  <p className="text-sm text-gray-500 mt-1">You are enrolled in {enrolledCourses.length} courses</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type="text" placeholder="Search courses..." className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50" />
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                      onClick={() => router.push(`/classroom/${course.id}`)}>
                      <div className="relative h-36 sm:h-40">
                        <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-sm ${course.iconColor}`}>
                            {course.grade}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-bold text-sm truncate">{course.title}</h3>
                          <p className="text-white/70 text-xs mt-0.5">{course.instructor}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${course.color} transition-all duration-500`} style={{ width: `${course.progress}%` }} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Week {course.currentWeek}/{course.totalWeeks}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{getDaysUntil(course.nextLessonDate)}</span>
                          </div>
                        </div>
                        <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/classroom/${course.id}`)}>
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image src={course.image} alt={course.title} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900">{course.title}</h3>
                        <p className="text-xs text-gray-500">{course.instructor}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <BookOpen className="w-3 h-3" />
                            <span>Week {course.currentWeek}/{course.totalWeeks}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Next: {getDaysUntil(course.nextLessonDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 sm:w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${course.color}`} style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── PROGRESS TAB ────────────────────────────────────── */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Learning Progress</h2>
                <p className="text-sm text-gray-500 mt-1">Track your performance across all courses</p>
              </div>

              {/* Overall Progress */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#progressGrad)" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        strokeDashoffset={`${2 * Math.PI * 52 * (1 - totalProgress / 100)}`}
                        strokeLinecap="round" />
                      <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalProgress}%</p>
                        <p className="text-[10px] text-gray-400">Overall</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                    {[
                      { label: 'Courses Enrolled', value: enrolledCourses.length.toString(), color: 'text-blue-600' },
                      { label: 'Lessons Completed', value: '24', color: 'text-emerald-600' },
                      { label: 'Assignments Done', value: '8', color: 'text-purple-600' },
                      { label: 'Quizzes Passed', value: '12', color: 'text-amber-600' },
                      { label: 'Hours Spent', value: '48h', color: 'text-cyan-600' },
                      { label: 'Badges Earned', value: '3', color: 'text-rose-600' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center sm:text-left">
                        <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Per Course Progress */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Course Breakdown</h3>
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${course.iconBg} ${course.iconColor} shrink-0`}>
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{course.title}</h4>
                          <p className="text-xs text-gray-500">Week {course.currentWeek}/{course.totalWeeks} • Grade: {course.grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-full sm:w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${course.color} transition-all duration-500`} style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                        <button onClick={() => router.push(`/classroom/${course.id}`)} className="text-xs font-semibold text-red-500 hover:text-red-600 shrink-0">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ASSIGNMENTS TAB ─────────────────────────────────── */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
                  <p className="text-sm text-gray-500 mt-1">{pendingAssignments} pending • {assignments.filter(a => a.status === 'graded').length} graded</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type="text" placeholder="Search..." className="w-full sm:w-40 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {assignments.map((a) => (
                  <div key={a.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`p-2.5 rounded-lg shrink-0 ${
                        a.courseColor === 'red' ? 'bg-red-50 text-red-500' :
                        a.courseColor === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                        a.courseColor === 'blue' ? 'bg-blue-50 text-blue-500' :
                        'bg-purple-50 text-purple-500'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{a.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{a.course}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(a.status)}`}>
                              {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                            </span>
                            {a.grade && (
                              <span className="text-xs font-bold text-emerald-600">{a.grade}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className={`text-xs font-medium ${a.status === 'overdue' ? 'text-red-500' : 'text-gray-500'}`}>
                            {getDaysUntil(a.dueDate)}
                          </span>
                        </div>
                      </div>
                      {a.status === 'pending' && (
                        <button className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition-all">
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PROFILE TAB ─────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 h-24 sm:h-32" />
                <div className="px-6 sm:px-8 pb-8 -mt-12 sm:-mt-16">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg shrink-0">
                      E
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Enoch</h2>
                      <p className="text-sm text-gray-500">enoch@ttacademy.edu</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">Active Student</span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">4 Courses</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input type="text" value="Enoch" readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" value="enoch@ttacademy.edu" readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input type="tel" value="+234 800 000 0000" readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <button className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                  </div>
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <LockIcon className="w-4.5 h-4.5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900 text-sm">Change Password</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                          <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                          <input type="password" placeholder="Enter new password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                          <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <button className="w-full py-2.5 px-6 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-4.5 h-4.5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="text-sm text-gray-700 font-medium">Email notifications</span>
                          <div className="w-10 h-6 bg-gray-300 rounded-full relative transition-colors">
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                          </div>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="text-sm text-gray-700 font-medium">Push notifications</span>
                          <div className="w-10 h-6 bg-red-500 rounded-full relative transition-colors">
                            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                          </div>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="text-sm text-gray-700 font-medium">SMS notifications</span>
                          <div className="w-10 h-6 bg-gray-300 rounded-full relative transition-colors">
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}