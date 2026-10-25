'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  GraduationCap,
  Code, Palette, Globe, Database, PieChart, Brain, Shield, Lock,
  Send, Smile, Megaphone, AlertTriangle, Paperclip, Moon, Sun, Users, X, LogOut
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'
import { ClassroomEmojiPicker } from '@/components/classroom-emoji-picker'
import { ClassroomMessageBubble } from '@/components/classroom-message-bubble'
import { useClassroomTheme } from '@/lib/hooks/use-classroom-theme'
import { mapClassroomMessage, type ClassroomMessageRecord } from '@/lib/classroom-chat'
import { announceClassroomJoin, announceClassroomLeave } from '@/lib/classroom-presence-announcements'
import { toggleClassroomReaction } from '@/lib/classroom-reactions'

type DbMessage = ClassroomMessageRecord

interface Message {
  id: string
  text: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  sender: 'me' | 'system' | 'mentor' | 'student'
  senderName?: string
  attachmentPath?: string
  attachmentName?: string
  attachmentMimeType?: string
  senderUserId?: string
  replyToMessageId?: string
  replyTo?: { id: string; content: string; sender_name: string }
  editedAt?: string
  isPinned?: boolean
  reactions?: Array<{ emoji: string; count: number; reacted: boolean }>
}

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)
  const dashboard = courseData.dashboard

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [message, setMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [openMessageActionsId, setOpenMessageActionsId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processedMessagesRef = useRef<Set<string>>(new Set())
  const prevMessagesLengthRef = useRef(0)
  const [studentData, setStudentData] = useState<{ name: string; email: string; avatar: string } | null>(null)
  const isRestrictedRef = useRef(false)
  const [onlineCount, setOnlineCount] = useState(1)
  const [onlineMembers, setOnlineMembers] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const { dark, setDark } = useClassroomTheme(courseSlug, currentUserId)

  // Let longer messages expand while keeping the composer bounded.
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const appendEmoji = (emoji: string) => {
    const input = textareaRef.current
    const start = input?.selectionStart ?? message.length
    const end = input?.selectionEnd ?? message.length
    const next = `${message.slice(0, start)}${emoji}${message.slice(end)}`
    setMessage(next)
    requestAnimationFrame(() => {
      if (!input) return
      input.style.height = 'auto'
      input.style.height = `${Math.min(input.scrollHeight, 160)}px`
      input.focus()
      const cursor = start + emoji.length
      input.setSelectionRange(cursor, cursor)
    })
  }

  // Auto-link URLs in message text
  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi
    const parts = text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi)
    
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0
        const href = part.startsWith('http') ? part : `https://${part}`
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#53BDEB] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  // Fetch logged-in student data
  useEffect(() => {
    async function fetchStudent() {
      try {
        const supabase = createClient()
        const [{ data: { user } }, { data: memberName, error: memberNameError }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.rpc('classroom_user_name', { p_course_slug: courseSlug }),
        ])
        if (user) setCurrentUserId(user.id)
        if (memberNameError) console.error('Could not load student classroom name:', memberNameError)
        const res = await fetch('/api/registrations/me')
        const json = await res.json()
        if (res.ok && json.data) {
          setStudentData({
            name: typeof memberName === 'string' ? memberName : json.data.name,
            email: json.data.email,
            avatar: json.data.avatar || '/placeholder-user.jpg',
          })
        } else if (typeof memberName === 'string') {
          setStudentData({ name: memberName, email: user?.email ?? '', avatar: '/placeholder-user.jpg' })
        }
      } catch (err) {
        console.error('Failed to load student classroom identity:', err)
      }
    }
    fetchStudent()
  }, [courseSlug])

  const studentName = studentData?.name || dashboard.profile.name || 'Student'

  // Auth state listener - redirect to login if signed out
  useEffect(() => {
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push(`/classroom/${courseSlug}/login`)
      }
    })
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Could not restore classroom session:', error)
      if (!session) {
        router.push(`/classroom/${courseSlug}/login`)
      } else {
        setCurrentUserId(session.user.id)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [courseSlug, router])

  // RESTRICTION CHECK - polls the API every 10 seconds for instant restriction detection
  useEffect(() => {
    const supabase = createClient()
    let checkInterval: NodeJS.Timeout | null = null
    let userEmail: string | null = null

    const checkRestriction = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) return

        if (!userEmail) {
          userEmail = session.user.email.toLowerCase()
        }

        const res = await fetch('/api/registrations/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (!res.ok) return
        
        const json = await res.json()
        
        if (json.data && json.data.restricted === true && !isRestrictedRef.current) {
          isRestrictedRef.current = true
          try {
            await supabase.auth.signOut()
          } catch (_) {}
          alert('Your account has been restricted by the admin. You have been logged out.')
          router.push(`/classroom/${courseSlug}/login`)
        } else if (json.data && json.data.restricted === false) {
          isRestrictedRef.current = false
        }
      } catch (err) {
        // Silently handle errors
      }
    }

    checkRestriction()
    checkInterval = setInterval(checkRestriction, 10000)

    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [courseSlug, router])
  
  // Fetch existing messages from DB + setup realtime subscription
  useEffect(() => {
    if (!courseSlug) return

    const supabase = createClient()
    const fetchMessages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)
        const res = await fetch(`/api/messages/get?course=${courseSlug}`)
        if (res.ok) {
          const data = await res.json()
          const dbMessages: Message[] = (data.data || []).map((msg: DbMessage) => mapClassroomMessage(msg, user?.id ?? null, 'student'))
          
          const seen = new Set<string>()
          const uniqueDbMessages = dbMessages.filter(msg => {
            if (seen.has(msg.id)) {
              console.warn('Duplicate message ID found:', msg.id)
              return false
            }
            seen.add(msg.id)
            return true
          })
          
          setMessages(prev => {
            const systemMessages = prev.filter(m => m.sender === 'system')
            const existingMessages = prev.filter(m => m.sender !== 'system' && !uniqueDbMessages.some(dbMessage => dbMessage.id === m.id))
            return [...systemMessages, ...uniqueDbMessages, ...existingMessages]
          })
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()

    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    void (async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user || !active) return
      const { data: memberName, error: memberNameError } = await supabase.rpc('classroom_user_name', {
        p_course_slug: courseSlug,
      })
      if (memberNameError) console.error('Could not load classroom member name:', memberNameError)
      setCurrentUserId(user.id)
      const presenceName = typeof memberName === 'string' ? memberName : studentName
      channel = supabase
      .channel(`classroom:${courseSlug}`, { config: { presence: { key: user.id } } })
      .on('presence', { event: 'sync' }, () => {
        const presence = channel?.presenceState() ?? {}
        const members = Object.values(presence).flat().map((member) => ({
          id: member.presence_ref,
          name: 'name' in member && typeof member.name === 'string' ? member.name : 'Class member',
          role: 'role' in member && typeof member.role === 'string' ? member.role : 'member',
        }))
        setOnlineMembers(members)
        setOnlineCount(members.length)
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'classroom_messages',
          filter: `course_slug=eq.${courseSlug}`,
        },
        (payload) => {
          const newMsg = payload.new as DbMessage
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id)
            if (exists) return prev
            
            const msg: Message = mapClassroomMessage(newMsg, user.id, 'student')
            
            const optimisticIndex = prev.findIndex(m => 
              m.sender === (newMsg.sender_role === 'admin' || newMsg.sender_role === 'teacher' ? 'mentor' : 'me') &&
              m.text === msg.text &&
              m.status === 'sending'
            )
            
            if (optimisticIndex >= 0) {
              const updated = [...prev]
              updated[optimisticIndex] = msg
              return updated
            }
            
            return [...prev, msg]
          })
        }
      )
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'classroom_messages',
        filter: `course_slug=eq.${courseSlug}`,
      }, (payload) => {
        const updated = payload.new as DbMessage
        setMessages((previous) => previous.map((item) => item.id === updated.id
          ? {
            ...item,
            text: updated.content,
            editedAt: updated.edited_at ?? undefined,
            isPinned: updated.is_pinned ?? false,
          }
          : item))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'classroom_messages',
      }, (payload) => {
        const deletedId = (payload.old as { id?: string }).id
        if (deletedId) setMessages((previous) => previous.filter((item) => item.id !== deletedId))
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'classroom_message_reactions',
      }, () => {
        void fetchMessages()
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel?.track({ name: presenceName, role: 'student', online_at: new Date().toISOString() })
          try {
            await announceClassroomJoin(courseSlug, user.id, presenceName)
          } catch (announcementError) {
            console.error('Could not record student classroom entry:', announcementError)
          }
        }
      })
    })()

    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [courseSlug])

  // Deduplicate messages
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      setMessages(prev => {
        const seen = new Set<string>()
        const unique = prev.filter(msg => {
          const key = `${msg.id}-${msg.text}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        prevMessagesLengthRef.current = unique.length
        return unique.length === prev.length ? prev : unique
      })
    }
  }, [messages.length])

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
      if (currentUserId) {
        try {
          await announceClassroomLeave(courseSlug, currentUserId, studentName)
        } catch (leaveError) {
          console.error('Could not record student classroom exit:', leaveError)
        }
      }
      await supabase.auth.signOut()
      setShowLogoutModal(false)
      router.push(`/classroom/${courseSlug}/login`)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const refreshChatMessages = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
    const response = await fetch(`/api/messages/get?course=${courseSlug}`, { cache: 'no-store' })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to refresh classroom messages.')
    const freshMessages: Message[] = (result.data as DbMessage[]).map((item) => mapClassroomMessage(item, user?.id ?? null, 'student'))
    setMessages((previous) => {
      const freshIds = new Set(freshMessages.map((item) => item.id))
      const messagesNotInResponse = previous.filter((item) => !freshIds.has(item.id))
      return [...freshMessages, ...messagesNotInResponse]
    })
  }

  const beginReply = (target: Message) => {
    setReplyingTo(target)
    setEditingMessageId(null)
    setOpenMessageActionsId(null)
    window.setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const beginEdit = (target: Message) => {
    setEditingMessageId(target.id)
    setReplyingTo(null)
    setMessage(target.text)
    setOpenMessageActionsId(null)
    window.setTimeout(() => {
      textareaRef.current?.focus()
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
      }
    }, 0)
  }

  const saveMessageEdit = async () => {
    if (!editingMessageId) return
    setIsSending(true)
    setError('')
    try {
      const response = await fetch('/api/messages/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: editingMessageId, content: message }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to edit this message.')
      setMessages((previous) => previous.map((item) => item.id === editingMessageId
        ? { ...item, text: result.data.content, editedAt: result.data.edited_at }
        : item))
      setEditingMessageId(null)
      setMessage('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Unable to edit this message.')
    } finally {
      setIsSending(false)
    }
  }

  const deleteChatMessage = async (target: Message) => {
    if (!window.confirm('Delete this message?')) return
    try {
      const response = await fetch('/api/messages/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: target.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to delete this message.')
      setMessages((previous) => previous.filter((item) => item.id !== target.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this message.')
    }
  }

  const reactToMessage = async (target: Message, emoji: string) => {
    setMessages((previous) => previous.map((item) => item.id === target.id
      ? { ...item, reactions: toggleClassroomReaction(item.reactions ?? [], emoji) }
      : item))
    try {
      const response = await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: target.id, emoji }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to add this reaction.')
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : 'Unable to add this reaction.')
      try {
        await refreshChatMessages()
      } catch (refreshError) {
        console.error('Could not restore classroom reactions:', refreshError)
      }
    }
  }

  const handleSendMessage = async () => {
    if (editingMessageId) {
      await saveMessageEdit()
      return
    }
    if (!message.trim() && !selectedFile) {
      setError('Write a message or choose a file to send.')
      return
    }

    const tempId = `temp-${Date.now()}`
    const sentText = message.trim()
    const file = selectedFile
    processedMessagesRef.current.add(tempId)
    
    const newMsg: Message = {
      id: tempId,
      text: sentText,
      timestamp: new Date(),
      status: 'sending',
      sender: 'me',
      attachmentName: file?.name,
      attachmentMimeType: file?.type,
      senderUserId: currentUserId ?? undefined,
      replyToMessageId: replyingTo?.id,
      replyTo: replyingTo ? { id: replyingTo.id, content: replyingTo.text, sender_name: replyingTo.senderName ?? 'Class member' } : undefined,
      reactions: [],
    }

    setMessages(prev => [...prev, newMsg])
    setMessage('')
    setReplyingTo(null)
    setIsSending(true)

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    let attachmentPath: string | undefined
    try {
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']
        if (!allowedTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, PDF, or text file.')
        if (file.size > 10 * 1024 * 1024) throw new Error('Files must be 10 MB or smaller.')
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Your classroom session has expired.')
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120) || 'attachment'
        attachmentPath = `${courseSlug}/${user.id}/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('classroom-files').upload(attachmentPath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })
        if (uploadError) throw uploadError
      }
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sentText,
          course: courseSlug,
          attachmentPath,
          attachmentName: file?.name,
          attachmentMimeType: file?.type,
          replyToMessageId: replyingTo?.id,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to send message.')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      const savedMessage = result.data as DbMessage
      setMessages((previous) => previous.map((item) => item.id === tempId ? {
        ...item,
        id: savedMessage.id,
        timestamp: new Date(savedMessage.created_at),
        status: 'sent',
        senderName: savedMessage.sender_name,
        senderUserId: savedMessage.sender_user_id,
        replyToMessageId: savedMessage.reply_to_message_id ?? undefined,
        attachmentPath: savedMessage.attachment_path ?? undefined,
        attachmentName: savedMessage.attachment_name ?? undefined,
        attachmentMimeType: savedMessage.attachment_mime_type ?? undefined,
      } : item))
    } catch (err) {
      setMessages((previous) => previous.filter((item) => item.id !== tempId))
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
      if (attachmentPath) {
        const { error: cleanupError } = await createClient().storage.from('classroom-files').remove([attachmentPath])
        if (cleanupError) console.error('Failed to remove unlinked classroom attachment:', cleanupError)
      }
    } finally {
      processedMessagesRef.current.delete(tempId)
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  return (
    <div className={`h-dvh min-h-0 flex font-sans antialiased overflow-hidden ${dark ? 'bg-[#111b21] text-[#e9edef]' : 'bg-white text-[#111b21]'}`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col w-full min-w-0 h-full min-h-0">
        
        <div className="flex flex-1 h-full min-h-0">
          <div className="flex flex-1 flex-col min-w-0 min-h-0">
            
            {/* Chat Header */}
            <div className={`${dark ? 'bg-[#202c33]' : 'bg-[#F0F2F5]'} px-4 py-2.5 flex items-center gap-3 shrink-0 z-10`}>
              <div className={`w-10 h-10 rounded-full ${dark ? 'bg-[#2a3942]' : 'bg-gray-200'} flex items-center justify-center shrink-0`}>
                {getCourseIcon('w-5 h-5')}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-[16px] font-semibold ${dark ? 'text-[#e9edef]' : 'text-[#111B21]'} leading-tight truncate`}>
                  {courseData.title} Classroom
                </h1>
                <p className={`truncate text-[11px] ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>{studentName}</p>
                <button type="button" onClick={() => setShowMembers(true)} className={`text-left text-[13px] ${dark ? 'text-[#aebac1]' : 'text-[#667781]'} leading-relaxed inline-flex items-center gap-1.5 hover:underline`}>
                  <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                  Class group · {onlineCount} online · See members
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDark((value) => !value)}
                  disabled={!currentUserId}
                  aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
                  title={`Switch to ${dark ? 'light' : 'dark'} mode`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:cursor-wait disabled:opacity-50 ${dark ? 'text-amber-300 hover:bg-[#2a3942]' : 'text-[#667781] hover:bg-gray-200 hover:text-gray-700'}`}
                >
                  {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  aria-label="Exit class"
                  title="Exit class"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? 'text-rose-300 hover:bg-[#2a3942]' : 'text-rose-600 hover:bg-rose-50'}`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              data-lenis-prevent=""
              className="classroom-chat-messages px-3 py-3 sm:px-4"
              style={{
                backgroundColor: dark ? "#0b141a" : "#efeae2",
                backgroundImage: `url("${dark
                  ? "https://res.cloudinary.com/djdbcoyot/image/upload/v1792921622/qjc8vemd46bw4dgmntjz.jpg"
                  : "https://res.cloudinary.com/djdbcoyot/image/upload/v1792921618/drh38kaz0synj4tpxylb.jpg"}")`,
                backgroundPosition: "center",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
              }}
            >
              <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
                
                {/* Loading */}
                {loadingMessages && (
                  <div className="flex justify-center my-8">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${dark ? 'bg-[#202c33]' : 'bg-white'}`}>
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
                      <span className={`${dark ? 'bg-[#182229] text-[#c1cbd1]' : 'bg-[#E1F3FB] text-[#54656F]'} text-[11px] font-medium px-3 py-1 rounded shadow-[0_1px_1px_rgba(0,0,0,0.06)]`}>
                        {group.date}
                      </span>
                    </div>

                    {group.messages.map((msg) => (
                      <ClassroomMessageBubble
                        key={msg.id}
                        message={msg}
                        isMine={msg.sender === 'me'}
                        isSystem={msg.sender === 'system'}
                        senderLabel={msg.sender === 'mentor' ? 'Teacher' : msg.sender === 'student' ? msg.senderName || 'Student' : undefined}
                        time={formatTime(msg.timestamp)}
                        content={renderMessageText(msg.text)}
                        dark={dark}
                        actionsOpen={openMessageActionsId === msg.id}
                        onToggleActions={() => setOpenMessageActionsId((current) => current === msg.id ? null : msg.id)}
                        onReply={() => beginReply(msg)}
                        onEdit={() => beginEdit(msg)}
                        onDelete={() => void deleteChatMessage(msg)}
                        onReact={(emoji) => void reactToMessage(msg, emoji)}
                      />
                    ))}
                  </div>
                ))}

                {!loadingMessages && messages.length === 0 && (
                  <div className="flex justify-center my-8">
                    <div className={`${dark ? 'bg-[#202c33]' : 'bg-white'} rounded-lg px-4 py-3 text-center max-w-sm shadow`}>
                      <p className={`text-[12.5px] ${dark ? 'text-[#aebac1]' : 'text-gray-500'}`}>No messages yet</p>
                      <p className="text-[11px] text-[#8696a0] mt-1">Send a message to start the conversation!</p>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
                <div className="h-8" />
              </div>
            </div>

            {/* Message Input Area */}
            <div className={`${dark ? 'bg-[#202c33]' : 'bg-[#F0F2F5]'} px-3 py-2 sm:px-4 shrink-0 z-10 mb-20`}>
              {showEmoji && <div className="mb-2"><ClassroomEmojiPicker dark={dark} onSelect={appendEmoji} /></div>}

              {(replyingTo || editingMessageId) && (
                <div className={`mb-2 flex items-start gap-3 rounded-xl border-l-4 px-3 py-2 ${dark ? 'border-emerald-400 bg-[#111b21] text-[#e9edef]' : 'border-emerald-700 bg-white text-[#111b21]'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-700">{editingMessageId ? 'Editing message' : `Replying to ${replyingTo?.senderName || 'class member'}`}</p>
                    <p className={`mt-0.5 line-clamp-2 text-xs ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>{editingMessageId ? 'Update your message and save.' : replyingTo?.text}</p>
                  </div>
                  <button type="button" aria-label="Cancel reply or edit" onClick={() => { setReplyingTo(null); setEditingMessageId(null); setMessage(''); if (textareaRef.current) textareaRef.current.style.height = 'auto' }} className="rounded-lg p-1"><X className="h-4 w-4" /></button>
                </div>
              )}

              {selectedFile && (
                <div className={`mb-2 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs ${dark ? 'bg-[#111b21] text-[#aebac1]' : 'bg-white text-[#667781]'}`}>
                  <span className="min-w-0 truncate">{selectedFile.name}</span>
                  <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="shrink-0 font-medium text-red-600">Remove</button>
                </div>
              )}
              <div className="flex items-end gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
                  className="hidden"
                  onChange={(event) => { setSelectedFile(event.target.files?.[0] ?? null); setError('') }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach a file" className={`p-2 rounded-full ${dark ? 'hover:bg-[#2a3942] text-[#aebac1]' : 'hover:bg-gray-200 text-[#667781]'}`}>
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className={`flex-1 rounded-2xl px-4 py-2 flex items-end ${dark ? 'bg-[#111b21]' : 'bg-white'}`}>
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      setError('')
                      autoResizeTextarea(e)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to your mentor..."
                    rows={1}
                    className={`w-full text-[16px] ${dark ? 'text-[#e9edef]' : 'text-[#111B21]'} placeholder-[#8696A0] bg-transparent focus:outline-none resize-none overflow-y-auto leading-[21px]`}
                    style={{ minHeight: '21px', maxHeight: '160px' }}
                  />
                </div>
                <button type="button" onClick={() => setShowEmoji((visible) => !visible)} aria-label="Open emoji picker" aria-expanded={showEmoji} title="Emoji" className={`rounded-full p-2.5 text-amber-500 transition-colors ${dark ? 'bg-[#2a3942] hover:bg-[#354650]' : 'bg-white hover:bg-amber-50'}`}>
                  <Smile className="h-5 w-5" />
                </button>

                {message.trim() || selectedFile ? (
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

      {showMembers && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="student-class-members-title" className={`w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${dark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]'}`}>
            <header className={`flex items-center justify-between border-b px-5 py-4 ${dark ? 'border-[#2a3942]' : 'border-gray-200'}`}>
              <div><h2 id="student-class-members-title" className="font-semibold">{courseData.title} members</h2><p className={`mt-1 text-xs ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>{onlineCount} currently online</p></div>
              <button type="button" aria-label="Close members" onClick={() => setShowMembers(false)} className="rounded-lg p-2"><X className="h-4 w-4" /></button>
            </header>
            <ul className="max-h-[60vh] overflow-y-auto p-2">
              {onlineMembers.map((member) => (
                <li key={member.id} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-50'}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069]/10 text-sm font-semibold text-[#008069]">{member.name.slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{member.name}</span><span className={`text-xs capitalize ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>{member.role}</span></span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </li>
              ))}
              {onlineMembers.length === 0 && <li className={`px-3 py-8 text-center text-sm ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>No one is online right now.</li>}
            </ul>
          </section>
        </div>
      )}

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setShowLogoutModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`${dark ? 'bg-[#202c33] border-[#2a3942] text-[#e9edef]' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl`}>
              <div className="px-6 pt-7 pb-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className={`text-[17px] font-bold mb-1 ${dark ? 'text-[#e9edef]' : 'text-gray-900'}`}>Exit class?</h3>
                <p className={`text-[13px] ${dark ? 'text-[#aebac1]' : 'text-gray-500'}`}>Are you sure you want to sign out and leave this classroom?</p>
              </div>
              <div className="px-6 pb-6 flex gap-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`flex-1 py-3 rounded-xl border text-[14px] transition-colors font-medium active:scale-[0.98] ${dark ? 'border-[#2a3942] text-[#e9edef] hover:bg-[#2a3942]' : 'border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-[14px] text-white font-semibold transition-colors active:scale-[0.98]"
                >
                  Exit class
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}