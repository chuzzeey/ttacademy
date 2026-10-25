'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Shield, BarChart3, Cpu, Globe, ShieldAlert, Palette, Code, Monitor, Server, Globe2, TrendingUp, Cloud, Database, ArrowLeft, Send, Menu, X, GraduationCap, LogOut, Home, BookMarked, User, Settings, Paperclip, Megaphone, UserCircle, Moon, Sun, Users, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { ClassroomEmojiPicker } from '@/components/classroom-emoji-picker'
import { ClassroomMessageBubble } from '@/components/classroom-message-bubble'
import { useClassroomTheme } from '@/lib/hooks/use-classroom-theme'
import { mapClassroomMessage, type ClassroomMessageRecord } from '@/lib/classroom-chat'

type DbMessage = ClassroomMessageRecord

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
  sender: 'me' | 'system' | 'student' | 'mentor'
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

export default function TeacherCoursePage() {
  const params = useParams()
  const router = useRouter()
  const course = courseData[params.course as string]
  const courseSlug = params.course as string
  const { dark, setDark } = useClassroomTheme(courseSlug)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  const [message, setMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [openMessageActionsId, setOpenMessageActionsId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineCount, setOnlineCount] = useState(1)
  const [onlineMembers, setOnlineMembers] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
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

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/teachers')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Reset the confirmation state whenever the menu is closed
  const closeMenu = () => {
    setShowLogoutDropdown(false)
    setConfirmingLogout(false)
  }

  const refreshChatMessages = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
    const response = await fetch(`/api/messages/get?course=${String(params.course)}`, { cache: 'no-store' })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to refresh classroom messages.')
    const freshMessages: Message[] = (result.data as DbMessage[]).map((item) => mapClassroomMessage(item, user?.id ?? null, 'teacher'))
    setMessages((previous) => [...previous.filter((item) => item.sender === 'system'), ...freshMessages])
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
    try {
      const response = await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: target.id, emoji }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to add this reaction.')
      await refreshChatMessages()
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : 'Unable to add this reaction.')
    }
  }

  const togglePinnedMessage = async (target: Message) => {
    try {
      const response = await fetch('/api/messages/pin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: target.id, isPinned: !target.isPinned }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update the pinned message.')
      setMessages((previous) => previous.map((item) => item.id === target.id
        ? { ...item, isPinned: result.data.is_pinned }
        : item))
    } catch (pinError) {
      setError(pinError instanceof Error ? pinError.message : 'Unable to update the pinned message.')
    }
  }

  // Fetch existing messages from DB + setup realtime subscription
  useEffect(() => {
    const courseSlug = params.course as string
    if (!courseSlug) return

    const supabase = createClient()
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserId(user.id)
          const { data: role, error: roleError } = await supabase.rpc('classroom_user_role', {
            p_course_slug: courseSlug,
          })
          if (roleError) console.error('Could not load classroom role:', roleError)
          else setCurrentUserRole(typeof role === 'string' ? role : null)
        }
        const res = await fetch(`/api/messages/get?course=${courseSlug}`)
        if (res.ok) {
          const data = await res.json()
          const dbMessages: Message[] = (data.data || []).map((msg: DbMessage) => mapClassroomMessage(msg, user?.id ?? null, 'teacher'))
          
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
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    void (async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user || !active) return
      setCurrentUserId(user.id)
      const { data: role, error: roleError } = await supabase.rpc('classroom_user_role', {
        p_course_slug: courseSlug,
      })
      if (roleError) console.error('Could not load classroom role:', roleError)
      else setCurrentUserRole(typeof role === 'string' ? role : null)
      const { data: memberName, error: memberNameError } = await supabase.rpc('classroom_user_name', {
        p_course_slug: courseSlug,
      })
      if (memberNameError) console.error('Could not load classroom member name:', memberNameError)
      const presenceName = typeof memberName === 'string'
        ? memberName
        : typeof user.user_metadata?.name === 'string'
          ? user.user_metadata.name
          : user.email?.split('@')[0] || 'Teacher'
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
            // Already have this exact DB row (by real id) - skip
            const exists = prev.some(m => m.id === newMsg.id)
            if (exists) return prev

            // If this INSERT is our own mentor message, it likely already exists
            // as an optimistic "temp-..." bubble from handleSendMessage.
            // Merge into that bubble instead of adding a second one.
            if (newMsg.sender_role === 'teacher') {
              const optimisticIndex = prev.findIndex(
                m => m.sender === 'me' && m.text === newMsg.content && m.id.startsWith('temp-')
              )
              if (optimisticIndex !== -1) {
                const updated = [...prev]
                updated[optimisticIndex] = {
                  ...updated[optimisticIndex],
                  id: newMsg.id,
                  status: 'delivered',
                  attachmentPath: newMsg.attachment_path ?? undefined,
                  attachmentName: newMsg.attachment_name ?? undefined,
                  attachmentMimeType: newMsg.attachment_mime_type ?? undefined,
                }
                return updated
              }
            }

            const msg: Message = mapClassroomMessage(newMsg, user.id, 'teacher')
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
          await channel?.track({ name: presenceName, role: 'teacher', online_at: new Date().toISOString() })
          const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course: courseSlug, content: `${presenceName} joined the class.` }),
          })
          if (!response.ok) console.error('Could not record teacher classroom entry:', await response.text())
        }
      })
    })()

    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
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
        attachmentPath = `${String(params.course)}/${user.id}/${crypto.randomUUID()}-${safeName}`
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
          course: params.course,
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
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-link URLs in message text
  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi
    const parts = text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi)
    
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0 // reset regex state
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
      className={`h-dvh min-h-0 flex flex-col overflow-hidden font-sans ${dark ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'}`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 shrink-0 shadow-sm ${dark ? 'bg-[#202c33]' : 'bg-[#008069]'}`}>
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
                <button type="button" onClick={() => setShowMembers(true)} className="text-[10px] sm:text-xs text-white/75 hover:text-white">Class group · {onlineCount} online · See members</button>
              </div>
            </div>

            {/* Right side - Hamburger menu */}
            <div className="relative flex items-center gap-1">
              <button
                onClick={() => {
                  if (showLogoutDropdown) {
                    closeMenu()
                  } else {
                    setShowLogoutDropdown(true)
                  }
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showLogoutDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg overflow-hidden z-50 ${dark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]'}`}
                  >
                    {!confirmingLogout ? (
                      <>
                        <button onClick={() => { setShowMembers(true); closeMenu() }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'}`}>
                          <Users className="w-4 h-4" /> Class members · {onlineCount} online
                        </button>
                        <button onClick={() => setDark((value) => !value)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'}`}>
                          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Switch to {dark ? 'light' : 'dark'} mode
                        </button>
                        <button
                          onClick={() => setConfirmingLogout(true)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-red-50'}`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Exit class</span>
                        </button>
                      </>
                    ) : (
                      // Step 2: confirmation
                      <div className="p-4">
                        <p className={`text-sm font-medium mb-3 ${dark ? 'text-[#e9edef]' : 'text-[#111B21]'}`}>
                          Are you sure you want to sign out and leave this classroom?
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleLogout}
                            className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                          >
                            Log out
                          </button>
                          <button
                            onClick={closeMenu}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${dark ? 'bg-[#2a3942] text-[#e9edef] hover:bg-[#354650]' : 'bg-gray-100 text-[#111B21] hover:bg-gray-200'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* WhatsApp Chat Container */}
      <div className="flex min-h-0 flex-1 flex-col">
        
        {/* Chat Header */}
        <div className={`border-b px-4 py-2 flex items-center gap-3 shrink-0 z-10 ${dark ? 'bg-[#202c33] border-[#2a3942]' : 'bg-[#F0F2F5] border-gray-200'}`}>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-[#2a3942] text-[#aebac1]' : 'bg-gray-200 text-[#54656f]'}`}>
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-[15px] ${dark ? 'text-[#e9edef]' : 'text-[#111B21]'} truncate leading-tight`}>
              {course.title} Classroom
            </p>
            <p className={`text-xs ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>Class group · {onlineCount} online</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          data-lenis-prevent=""
          className="classroom-chat-messages px-3 py-3 sm:px-4 space-y-1"
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
          {/* Loading history */}
          {loadingHistory && (
            <div className="flex justify-center my-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${dark ? 'bg-[#202c33]' : 'bg-white'}`}>
                <div className="w-4 h-4 border-2 border-[#008069] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[#667781]">Loading chat history...</span>
              </div>
            </div>
          )}

          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex justify-center my-3">
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
                  senderLabel={msg.sender === 'student' ? msg.senderName || 'Student' : undefined}
                  time={formatTime(msg.timestamp)}
                  content={renderMessageText(msg.text)}
                  dark={dark}
                  actionsOpen={openMessageActionsId === msg.id}
                  onToggleActions={() => setOpenMessageActionsId((current) => current === msg.id ? null : msg.id)}
                  onReply={() => beginReply(msg)}
                  onEdit={() => beginEdit(msg)}
                  onDelete={() => void deleteChatMessage(msg)}
                  canPin={currentUserRole === 'admin' || currentUserRole === 'teacher'}
                  onTogglePin={() => void togglePinnedMessage(msg)}
                  onReact={(emoji) => void reactToMessage(msg, emoji)}
                />
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
        <div className={`${dark ? 'bg-[#202c33]' : 'bg-[#F0F2F5]'} px-3 py-2 sm:px-4 shrink-0 z-10`}>
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
            <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach a file" className={`p-2 rounded-full transition-colors shrink-0 ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
              <Paperclip className="w-6 h-6 text-[#8696A0]" />
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
                placeholder="Type a message"
                rows={1}
                className={`w-full text-[15px] ${dark ? 'text-[#e9edef]' : 'text-[#111B21]'} placeholder-[#8696A0] bg-transparent focus:outline-none resize-none overflow-y-auto leading-[21px]`}
                style={{ minHeight: '21px', maxHeight: '160px' }}
              />
            </div>
            <button type="button" onClick={() => setShowEmoji((visible) => !visible)} aria-label="Open emoji picker" aria-expanded={showEmoji} title="Emoji" className={`rounded-full p-2.5 text-amber-500 transition-colors shrink-0 ${dark ? 'bg-[#2a3942] hover:bg-[#354650]' : 'bg-white hover:bg-amber-50'}`}>
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
              <button className={`p-2 rounded-full transition-colors shrink-0 ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
                <Send className="w-6 h-6 text-[#8696A0]" />
              </button>
            )}
          </div>
        </div>
      </div>
      {showMembers && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="teacher-class-members-title" className={`w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${dark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]'}`}>
            <header className={`flex items-center justify-between border-b px-5 py-4 ${dark ? 'border-[#2a3942]' : 'border-gray-200'}`}>
              <div><h2 id="teacher-class-members-title" className="font-semibold">{course.title} members</h2><p className={`mt-1 text-xs ${dark ? 'text-[#aebac1]' : 'text-[#667781]'}`}>{onlineCount} currently online</p></div>
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
    </main>
  )
}