'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Shield, BarChart3, Cpu, Globe, ShieldAlert, Palette, Code, Monitor, Server, Globe2, TrendingUp, Cloud, Database, ArrowLeft, Send, Menu, X, GraduationCap, LogOut, Home, BookMarked, User, Settings, Paperclip, ImagePlus, Check, CheckCheck, Clock, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

interface DbMessage {
  id: string
  title: string
  content: string
  sender_name: string
  course: string
  created_at: string
}

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
  emoji: string
  students: number
  color: string
  gradient: string
  lightBg: string
  iconBg: string
  iconColor: string
  borderColor: string
  accent: string
}> = {
  'cybersecurity': { title: 'Cybersecurity', icon: Shield, emoji: '🔒', students: 24, color: 'from-red-600 to-red-800', gradient: 'from-red-500/20 via-red-600/10 to-red-800/20', lightBg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', borderColor: 'border-red-200', accent: 'red' },
  'data-science': { title: 'Data Science', icon: BarChart3, emoji: '📊', students: 31, color: 'from-emerald-600 to-emerald-800', gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-800/20', lightBg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200', accent: 'emerald' },
  'ai-automation': { title: 'AI Automation', icon: Cpu, emoji: '🤖', students: 18, color: 'from-amber-600 to-amber-800', gradient: 'from-amber-500/20 via-amber-600/10 to-amber-800/20', lightBg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', borderColor: 'border-amber-200', accent: 'amber' },
  'computer-networking': { title: 'Computer Networking', icon: Globe, emoji: '🌐', students: 22, color: 'from-cyan-600 to-cyan-800', gradient: 'from-cyan-500/20 via-cyan-600/10 to-cyan-800/20', lightBg: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', borderColor: 'border-cyan-200', accent: 'cyan' },
  'ethical-hacking': { title: 'Ethical Hacking', icon: ShieldAlert, emoji: '💻', students: 15, color: 'from-rose-600 to-rose-800', gradient: 'from-rose-500/20 via-rose-600/10 to-rose-800/20', lightBg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', borderColor: 'border-rose-200', accent: 'rose' },
  'graphic-design': { title: 'Graphic Design', icon: Palette, emoji: '🎨', students: 27, color: 'from-pink-600 to-pink-800', gradient: 'from-pink-500/20 via-pink-600/10 to-pink-800/20', lightBg: 'bg-pink-50', iconBg: 'bg-pink-100', iconColor: 'text-pink-600', borderColor: 'border-pink-200', accent: 'pink' },
  'uiux-design': { title: 'UI/UX Design', icon: Palette, emoji: '🎯', students: 20, color: 'from-purple-600 to-purple-800', gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/20', lightBg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', borderColor: 'border-purple-200', accent: 'purple' },
  'full-stack-development': { title: 'Full Stack Development', icon: Code, emoji: '⚡', students: 35, color: 'from-blue-600 to-blue-800', gradient: 'from-blue-500/20 via-blue-600/10 to-blue-800/20', lightBg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', borderColor: 'border-blue-200', accent: 'blue' },
  'frontend-development': { title: 'Frontend Development', icon: Monitor, emoji: '🎨', students: 29, color: 'from-sky-600 to-sky-800', gradient: 'from-sky-500/20 via-sky-600/10 to-sky-800/20', lightBg: 'bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', borderColor: 'border-sky-200', accent: 'sky' },
  'backend-development': { title: 'Backend Development', icon: Server, emoji: '⚙️', students: 23, color: 'from-indigo-600 to-indigo-800', gradient: 'from-indigo-500/20 via-indigo-600/10 to-indigo-800/20', lightBg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200', accent: 'indigo' },
  'web-development': { title: 'Web Development', icon: Globe2, emoji: '🌍', students: 33, color: 'from-teal-600 to-teal-800', gradient: 'from-teal-500/20 via-teal-600/10 to-teal-800/20', lightBg: 'bg-teal-50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', borderColor: 'border-teal-200', accent: 'teal' },
  'digital-marketing': { title: 'Digital Marketing', icon: TrendingUp, emoji: '📈', students: 26, color: 'from-orange-600 to-orange-800', gradient: 'from-orange-500/20 via-orange-600/10 to-orange-800/20', lightBg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', borderColor: 'border-orange-200', accent: 'orange' },
  'cloud-computing': { title: 'Cloud Computing', icon: Cloud, emoji: '☁️', students: 19, color: 'from-violet-600 to-violet-800', gradient: 'from-violet-500/20 via-violet-600/10 to-violet-800/20', lightBg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', borderColor: 'border-violet-200', accent: 'violet' },
  'data-analysis': { title: 'Data Analysis', icon: Database, emoji: '📉', students: 21, color: 'from-lime-600 to-lime-800', gradient: 'from-lime-500/20 via-lime-600/10 to-lime-800/20', lightBg: 'bg-lime-50', iconBg: 'bg-lime-100', iconColor: 'text-lime-600', borderColor: 'border-lime-200', accent: 'lime' },
}

interface Message {
  id: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  sender: 'me' | 'system' | 'student'
  senderName?: string
}

export default function TeacherCoursePage() {
  const params = useParams()
  const router = useRouter()
  const course = courseData[params.course as string]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/teachers')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const emojis = ['😊', '👍', '🎉', '📚', '💡', '🔥', '✅', '⭐', '💪', '👏', '🎯', '📌', '📢', '💬', '🤝', '🌟']

  // Fetch existing messages from DB + setup realtime subscription
  useEffect(() => {
    const courseSlug = params.course as string
    if (!courseSlug) return

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/get?course=${courseSlug}`)
        if (res.ok) {
          const data = await res.json()
          const dbMessages: Message[] = (data.data || []).map((msg: DbMessage) => ({
            id: msg.id,
            text: msg.content,
            timestamp: new Date(msg.created_at),
            status: 'read' as const,
            sender: msg.sender_name === 'Mentor' ? ('me' as const) : ('student' as const),
            senderName: msg.sender_name
          }))
          
          setMessages(prev => {
            const initial = prev.filter(m => m.sender === 'system')
            const existingIds = new Set([...initial, ...dbMessages].map(m => m.id))
            const uniqueDbMessages = dbMessages.filter(m => !existingIds.has(m.id))
            return [...initial, ...uniqueDbMessages]
          })
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchMessages()

    // Setup Supabase Realtime subscription for live messages
    const supabase = createClient()
    const channel = supabase
      .channel(`teacher-messages:${courseSlug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `course=eq.${courseSlug}`,
        },
        (payload) => {
          const newMsg = payload.new as DbMessage
          setMessages(prev => {
            // Already have this exact DB row (by real id) - skip
            const exists = prev.some(m => m.id === newMsg.id)
            if (exists) return prev

            // If this INSERT is our own mentor message, it likely already exists
            // as an optimistic "temp-..." bubble from handleSendMessage.
            // Merge into that bubble instead of adding a second one.
            if (newMsg.sender_name === 'Mentor') {
              const optimisticIndex = prev.findIndex(
                m => m.sender === 'me' && m.text === newMsg.content && m.id.startsWith('temp-')
              )
              if (optimisticIndex !== -1) {
                const updated = [...prev]
                updated[optimisticIndex] = {
                  ...updated[optimisticIndex],
                  id: newMsg.id,
                  status: 'delivered',
                }
                return updated
              }
            }

            const msg: Message = {
              id: newMsg.id,
              text: newMsg.content,
              timestamp: new Date(newMsg.created_at),
              status: 'read',
              sender: newMsg.sender_name === 'Mentor' ? 'me' : 'student',
              senderName: newMsg.sender_name
            }
            return [...prev, msg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.course])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    if (!message.trim()) {
      setError('Please write a message to send.')
      return
    }

    const tempId = `temp-${Date.now()}`
    const newMsg: Message = {
      id: tempId,
      text: message.trim(),
      timestamp: new Date(),
      status: 'sending',
      sender: 'me'
    }

    setMessages(prev => [...prev, newMsg])
    const sentText = message.trim()
    setMessage('')
    setIsSending(true)

    // Simulate send status changes
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, status: 'sent' as const } : m)
      )
    }, 800)
  
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, status: 'delivered' as const } : m)
      )
    }, 1500)

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, status: 'read' as const } : m)
      )
      setIsSending(false)
    }, 2500)

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Announcement',
          content: sentText,
          course: params.course,
          sender_name: 'Mentor',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
      }
    } catch (err) {
      setError('Failed to send message. Please try again.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3.5 h-3.5 text-[#667781]" />
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-[#667781]" />
      case 'delivered':
        return <Check className="w-3.5 h-3.5 text-[#667781]" />
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
      default:
        return <Clock className="w-3.5 h-3.5 text-[#667781]" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateSeparator = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'TODAY'
    if (diffDays === 1) return 'YESTERDAY'
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  }

  // Group messages by date for separators
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''
  messages.forEach(msg => {
    const dateStr = formatDateSeparator(msg.timestamp)
    if (dateStr !== currentDate) {
      currentDate = dateStr
      groupedMessages.push({ date: dateStr, messages: [msg] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg)
    }
  })

  return (
    <main
      className="min-h-screen font-sans"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#008069] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Left side - Back button and Course name */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/teachers')}
                className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <p className="text-sm sm:text-base font-bold text-white">{course.title}</p>
                <p className="text-[10px] sm:text-xs text-white/70 hidden sm:block">Mentor Portal</p>
              </div>
            </div>

            {/* Right side - Logout dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <span className="hidden sm:block text-sm font-medium text-white">Menu</span>
              </button>

              {/* Logout Dropdown */}
              <AnimatePresence>
                {showLogoutDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* WhatsApp Chat Container */}
      <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
        
        {/* Chat Header */}
        <div className="bg-[#F0F2F5] border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0 z-10">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[15px] text-[#111B21] truncate leading-tight">
              Live chat
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-1"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#ECE5DD',
          }}
        >
          {/* Loading history */}
          {loadingHistory && (
            <div className="flex justify-center my-8">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <div className="w-4 h-4 border-2 border-[#008069] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[#667781]">Loading chat history...</span>
              </div>
            </div>
          )}

          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex justify-center my-3">
                <span className="bg-[#E1F3FB] text-[11px] text-[#54656F] font-medium px-3 py-1 rounded shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                  {group.date}
                </span>
              </div>

              {group.messages.map((msg) => (
                <div key={msg.id}>
                  {msg.sender === 'system' ? (
                    // System message (left side)
                    <div className="flex justify-start mb-1 group">
                      <div 
                        className="relative max-w-[70%] sm:max-w-[60%] px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.06)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow"
                        style={{ 
                          backgroundColor: '#FFFFFF',
                          borderRadius: '4px 8px 8px 8px',
                        }}
                      >
                        <p className="text-[14px] text-[#111B21] leading-[19px] break-words whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[11px] text-[#667781] leading-[13px]">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : msg.sender === 'student' ? (
                    // Student message (left side, white bubble like incoming)
                    <div className="flex justify-start mb-1 group">
                      <div className="max-w-[70%] sm:max-w-[60%]">
                        {/* Student name label */}
                        <div className="flex items-center gap-2 mb-[2px] ml-[2px]">
                          <div className="w-[20px] h-[20px] rounded-full bg-[#008069] flex items-center justify-center shrink-0">
                            <span className="text-white text-[8px] font-bold">{msg.senderName?.charAt(0) || 'S'}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#008069]">{msg.senderName || 'Student'}</span>
                        </div>
                        <div 
                          className="relative px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.06)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow"
                          style={{ 
                            backgroundColor: '#FFFFFF',
                            borderRadius: '4px 8px 8px 8px',
                          }}
                        >
                          <p className="text-[14px] text-[#111B21] leading-[19px] break-words whitespace-pre-wrap">{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[11px] text-[#667781] leading-[13px]">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // My message (right side) - WhatsApp green
                    <div className="flex justify-end mb-1 group relative">
                        <div 
                          className="relative px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.06)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow"
                          style={{ 
                            backgroundColor: '#D9FDD3',
                            borderRadius: '8px 4px 8px 8px',
                          }}
                        >
                          <p className="text-[14px] text-[#111B21] leading-[19px] break-words whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          <span className="text-[11px] text-[#667781] leading-[13px]">
                            {formatTime(msg.timestamp)}
                          </span>
                          <span className="flex items-center">
                            {getStatusIcon(msg.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Inline error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center my-2"
            >
              <span className="bg-red-500 text-white text-[12px] px-3 py-1.5 rounded-full shadow-sm">
                {error}
              </span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="bg-[#F0F2F5] px-3 py-2 sm:px-4 shrink-0 z-10">
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-gray-200"
              >
                <div className="flex flex-wrap gap-1.5 p-2 bg-white">
                  {emojis.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(prev => prev + emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-1.5">
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors shrink-0">
              <ImagePlus className="w-6 h-6 text-[#8696A0]" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors shrink-0">
              <Paperclip className="w-6 h-6 text-[#8696A0]" />
            </button>
            
            <div className="flex-1 bg-white rounded-lg px-4 py-2 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="w-full text-[15px] text-[#111B21] placeholder-[#8696A0] bg-transparent focus:outline-none"
              />
            </div>

            {message.trim() ? (
              <button 
                onClick={handleSendMessage}
                disabled={isSending}
                className="p-2 rounded-full bg-[#008069] hover:bg-[#017561] transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-6 h-6 text-white" fill="white" />
                )}
              </button>
            ) : (
              <button className="p-2 rounded-full hover:bg-gray-200 transition-colors shrink-0">
                <Send className="w-6 h-6 text-[#8696A0]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}