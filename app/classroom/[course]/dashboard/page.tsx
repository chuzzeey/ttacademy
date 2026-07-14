'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search, MoreVertical, GraduationCap,
  Code, Palette, Globe, Database, PieChart, Brain, Shield, Lock,
  ArrowLeft, Send, Check, CheckCheck, Clock, Smile, Megaphone
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'

interface DbMessage {
  id: string
  title: string
  content: string
  sender_name: string
  course: string
  created_at: string
}

interface Message {
  id: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  sender: 'me' | 'system' | 'mentor'
  senderName?: string
}

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)
  const dashboard = courseData.dashboard

  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [showChatList, setShowChatList] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const processedMessagesRef = useRef<Set<string>>(new Set()) // Track processed message IDs
  const [studentData, setStudentData] = useState<{ name: string; email: string; avatar: string } | null>(null)

  const emojis = ['😊', '👍', '🎉', '📚', '💡', '🔥', '✅', '⭐', '💪', '👏', '🎯', '📌', '📢', '💬', '🤝', '🌟']

  // Fetch logged-in student data
  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await fetch('/api/registrations/me')
        const json = await res.json()
        if (res.ok && json.data) {
          setStudentData({
            name: json.data.name,
            email: json.data.email,
            avatar: json.data.avatar || '/placeholder-user.jpg',
          })
        }
      } catch (err) { /* silently fall back to mock data */ }
    }
    fetchStudent()
  }, [])

  const studentName = studentData?.name || dashboard.profile.name || 'Student'
  const studentAvatar = studentData?.avatar || dashboard.profile.avatar

  // Auth state listener - redirect to login if signed out
  useEffect(() => {
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push(`/classroom/${courseSlug}/login`)
      }
    })
    
    // Also check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push(`/classroom/${courseSlug}/login`)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [courseSlug, router])
  
  // Fetch existing messages from DB + setup realtime subscription
  useEffect(() => {
    if (!courseSlug) return

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
            sender: msg.sender_name === 'Mentor' ? ('mentor' as const) : ('me' as const),
            senderName: msg.sender_name,
          }))
          
          // Replace all messages with fetched ones (system messages are preserved)
          setMessages(prev => {
            const systemMessages = prev.filter(m => m.sender === 'system')
            const allIds = new Set(dbMessages.map(m => m.id))
            return [...systemMessages, ...dbMessages]
          })
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()

    // Setup Supabase Realtime subscription for live messages
    const supabase = createClient()
    const channel = supabase
      .channel(`student-messages:${courseSlug}`)
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
            const exists = prev.some(m => m.id === newMsg.id)
            if (exists) return prev
            
            const msg: Message = {
              id: newMsg.id,
              text: newMsg.content,
              timestamp: new Date(newMsg.created_at),
              status: 'read',
              sender: newMsg.sender_name === 'Mentor' ? 'mentor' : 'me',
              senderName: newMsg.sender_name,
            }
            
            // Check if this is an optimistic update (sending status) that needs to be replaced
            const optimisticIndex = prev.findIndex(m => 
              m.sender === (newMsg.sender_name === 'Mentor' ? 'mentor' : 'me') &&
              m.text === msg.text &&
              m.status === 'sending'
            )
            
            if (optimisticIndex >= 0) {
              // Replace the optimistic message with the real one
              const updated = [...prev]
              updated[optimisticIndex] = msg
              return updated
            }
            
            return [...prev, msg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [courseSlug])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getCourseIcon = (sizeClass: string = 'w-5 h-5') => {
    const iconMap: Record<string, React.ReactNode> = {
      'cybersecurity': <Shield className={`${sizeClass} text-[#008069]`} />,
      'data-science': <Brain className={`${sizeClass} text-[#008069]`} />,
      'frontend': <Code className={`${sizeClass} text-[#008069]`} />,
      'backend': <Database className={`${sizeClass} text-[#008069]`} />,
      'fullstack': <Globe className={`${sizeClass} text-[#008069]`} />,
      'uiux': <Palette className={`${sizeClass} text-[#008069]`} />,
      'graphic-design': <Palette className={`${sizeClass} text-[#008069]`} />,
      'ethical-hacking': <Shield className={`${sizeClass} text-[#008069]`} />,
    };
    return iconMap[courseSlug] || <GraduationCap className={`${sizeClass} text-[#008069]`} />;
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

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setShowLogoutModal(false)
      setShowProfileDropdown(false)
      router.push(`/classroom/${courseSlug}/login`)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleHelpSupport = () => {
    const phone = '2348034826276'
    const text = `Hello, I need help. Name: ${studentName}, Email: ${studentData?.email || 'N/A'}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
    setShowProfileDropdown(false)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Please write a message to send.')
      return
    }

    const tempId = `temp-${Date.now()}`
    const sentText = message.trim()
    
    // Track this temp ID
    processedMessagesRef.current.add(tempId)
    
    const newMsg: Message = {
      id: tempId,
      text: sentText,
      timestamp: new Date(),
      status: 'sending',
      sender: 'me'
    }

    setMessages(prev => [...prev, newMsg])
    setMessage('')
    setIsSending(true)

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Reply from Student',
          content: sentText,
          course: courseSlug,
          sender_name: studentName,
        }),
      })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to send message')
          processedMessagesRef.current.delete(tempId)
          setIsSending(false)
        }
      } catch (err) {
        setError('Failed to send message. Please try again.')
        processedMessagesRef.current.delete(tempId)
        setIsSending(false)
      }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Group messages by date
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

  const dummyChats = [
    { name: `${courseData.title} Classroom`, lastMsg: messages.length > 0 ? messages[messages.length - 1].text : 'No messages yet', time: messages.length > 0 ? formatTime(messages[messages.length - 1].timestamp) : '', unread: messages.filter(m => m.sender === 'mentor').length, active: true },
  ]

  return (
    <div className="h-screen flex font-sans antialiased overflow-hidden"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col w-full min-w-0 h-full">
        
        <div className="flex flex-1 h-full">
          
          {/* ===== CHAT LIST ===== */}
          <div className={`${showChatList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[380px] lg:w-[400px] xl:w-[420px] border-r border-gray-200 bg-white shrink-0`}>
            
            <div className="bg-[#F0F2F5] px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 shrink-0">
                  <Image
                    src={studentAvatar}
                    alt={studentName}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[16px] font-semibold text-[#111B21]">{studentName}</p>
              </div>
            
            </div>

            <div className="bg-white px-3 py-2 shrink-0">
              <div className="bg-[#F0F2F5] rounded-lg flex items-center px-3 py-1.5 gap-3">
                <Search className="w-4 h-4 text-[#667781]" />
                <input type="text" placeholder="Search or start new chat" className="w-full bg-transparent text-sm text-[#111B21] placeholder-[#667781] focus:outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {dummyChats.map((chat) => (
                <div
                  key={chat.name}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F0F2F5] transition-colors border-b border-gray-100 ${chat.active ? 'bg-[#F0F2F5]' : ''}`}
                  onClick={() => setShowChatList(false)}
                >
                  <div className="w-[49px] h-[49px] rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gray-200">
                    <span className="text-[#008069] text-xl font-bold">{courseData.title.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[16px] font-medium text-[#111B21] truncate">{chat.name}</p>
                      <span className="text-[12px] text-[#667781] shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[13px] text-[#667781] truncate">{chat.lastMsg}</p>
                      {chat.unread > 0 && (
                        <span className="bg-[#008069] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0 ml-2">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== CHAT AREA ===== */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Chat Header */}
            <div className="bg-[#F0F2F5] px-4 py-2.5 flex items-center gap-3 shrink-0 z-10">
              {!showChatList && (
                <button
                  onClick={() => setShowChatList(true)}
                  className="md:hidden shrink-0 text-gray-500 hover:text-gray-700 transition-colors rounded-lg p-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                {getCourseIcon('w-5 h-5')}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[16px] font-semibold text-[#111B21] leading-tight truncate">
                  {courseData.title} Classroom
                </h1>
                <p className="text-[13px] text-[#667781] leading-relaxed inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                  Mentor is online
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showProfileDropdown && (
                    <>
                      <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/10" onClick={() => setShowProfileDropdown(false)} />
                      <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="py-1">
                          <button onClick={() => router.push(`/classroom/${courseSlug}/dashboard/profile`)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">Profile Settings</button>
                          <button onClick={handleHelpSupport} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">Help & Support</button>
                        </div>
                        <div className="border-t border-gray-200">
                          <button onClick={() => { setShowLogoutModal(true); setShowProfileDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-gray-100 transition-colors">Logout</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto px-3 sm:px-4 py-3"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#ECE5DD',
              }}
            >
              <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
                
                {/* Loading */}
                {loadingMessages && (
                  <div className="flex justify-center my-8">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                      <div className="w-4 h-4 border-2 border-[#008069] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-[#667781]">Loading messages...</span>
                    </div>
                  </div>
                )}

                {/* Grouped Messages */}
                {!loadingMessages && groupedMessages.map((group) => (
                  <div key={group.date}>
                    {/* Date Separator */}
                    <div className="flex justify-center my-4">
                      <span className="bg-[#E1F3FB] text-[11px] text-[#54656F] font-medium px-3 py-1 rounded shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                        {group.date}
                      </span>
                    </div>

                    {group.messages.map((msg) => (
                      <div key={msg.id}>
                        {msg.sender === 'system' ? (
                          // System message (left, white bubble)
                          <div className="flex justify-start mb-1 group">
                            <div 
                              className="relative max-w-[70%] sm:max-w-[60%] px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                              style={{ backgroundColor: '#FFFFFF', borderRadius: '4px 8px 8px 8px' }}
                            >
                              <p className="text-[14px] text-[#111B21] leading-[19px] break-words whitespace-pre-wrap">{msg.text}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[11px] text-[#667781]">{formatTime(msg.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ) : msg.sender === 'mentor' ? (
                          // Mentor message (left, white bubble with name)
                          <div className="flex justify-start mb-1 group">
                            <div className="max-w-[70%] sm:max-w-[60%]">
                              <div className="flex items-center gap-2 mb-[2px] ml-[2px]">
                                <div className="w-[20px] h-[20px] rounded-full bg-[#008069] flex items-center justify-center shrink-0">
                                  <span className="text-white text-[8px] font-bold">M</span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#008069]">Mentor</span>
                              </div>
                              <div 
                                className="relative px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.06)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow"
                                style={{ backgroundColor: '#FFFFFF', borderRadius: '4px 8px 8px 8px' }}
                              >
                                <p className="text-[14px] text-[#111B21] leading-[19px] break-words whitespace-pre-wrap">{msg.text}</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[11px] text-[#667781]">{formatTime(msg.timestamp)}</span>
                                  <svg viewBox="0 0 16 11" className="w-[14px] h-[10px]">
                                    <path d="M2 5.5L4.5 8L9 3.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                    <path d="M6 5.5L8.5 8L13 3.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // My message (right, green bubble)
                          <div className="flex justify-end mb-1 group relative">
                            <div 
                              className="relative max-w-[70%] sm:max-w-[60%] px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.06)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow"
                              style={{ backgroundColor: '#D9FDD3', borderRadius: '8px 4px 8px 8px' }}
                            >
                              <p className="text-[14px] text-[#111B21] leading-[19px] break-words whitespace-pre-wrap">{msg.text}</p>
                              <div className="flex items-center justify-end gap-0.5 mt-0.5">
                                <span className="text-[11px] text-[#667781]">{formatTime(msg.timestamp)}</span>
                                {msg.status === 'sending' && <Clock className="w-3.5 h-3.5 text-[#667781]" />}
                                {(msg.status === 'sent' || msg.status === 'delivered') && <Check className="w-3.5 h-3.5 text-[#667781]" />}
                                {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Empty state */}
                {!loadingMessages && messages.length === 0 && (
                  <div className="flex justify-center my-8">
                    <div className="bg-white rounded-lg px-4 py-3 text-center max-w-sm shadow">
                      <p className="text-[12.5px] text-gray-500">No messages yet</p>
                      <p className="text-[11px] text-[#667781] mt-1">Send a message to start the conversation!</p>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
                <div className="h-8" />
              </div>
            </div>

            {/* Message Input Area */}
            <div className="bg-[#F0F2F5] px-3 py-2 sm:px-4 shrink-0 z-10 mb-20">
              {/* Emoji picker */}
              <div className={`overflow-hidden transition-all duration-200 ${showEmoji ? 'max-h-28 mb-2' : 'max-h-0'}`}>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-lg">
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
              </div>

              <div className="flex items-end gap-1.5">
                <div className="flex-1 bg-white rounded-lg px-4 py-2 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to your mentor..."
                    className="w-full text-[16px] text-[#111B21] placeholder-[#8696A0] bg-transparent focus:outline-none"
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
        </div>
      </div>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setShowLogoutModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="px-6 pt-7 pb-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 mb-1">Logout?</h3>
                <p className="text-[13px] text-gray-500">Are you sure you want to log out of your account?</p>
              </div>
              <div className="px-6 pb-6 flex gap-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] transition-colors font-medium active:scale-[0.98] text-gray-900 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-[14px] text-white font-semibold transition-colors active:scale-[0.98]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
