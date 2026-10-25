"use client"

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoaderCircle, LogOut, Menu, Moon, Paperclip, Send, Smile, Sun, Users, X, Pin, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { COURSE_CATALOG } from "@/lib/course-catalog"
import { ClassroomAttachment } from "@/components/classroom-attachment"
import { ClassroomEmojiPicker } from "@/components/classroom-emoji-picker"
import { ClassroomMessageActions, MessageReactionList } from "@/components/classroom-message-actions"
import { useAdminTheme } from "@/app/dashboard/components/dashboard/admin-theme-provider"
import { announceClassroomJoin, announceClassroomLeave } from "@/lib/classroom-presence-announcements"
import { toggleClassroomReaction } from "@/lib/classroom-reactions"
import { useClassroomChatScroll } from "@/lib/hooks/use-classroom-chat-scroll"
import { ClassroomNewMessagesButton } from "@/components/classroom-new-messages-button"

type ChatMessage = {
  id: string
  course_slug: string
  sender_user_id: string
  sender_role: "admin" | "teacher" | "student"
  sender_name: string
  content: string
  attachment_path: string | null
  attachment_name: string | null
  attachment_mime_type: string | null
  created_at: string
  reply_to_message_id?: string | null
  reply_to?: { id: string; content: string; sender_name: string } | null
  edited_at?: string | null
  is_pinned?: boolean
  pinned_at?: string | null
  pinned_by?: string | null
  reactions?: Array<{ emoji: string; count: number; reacted: boolean }>
}

type ClassroomMember = {
  id: string
  name: string
  role: string
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain"])
const maxFileSize = 10 * 1024 * 1024

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi)
  return parts.map((part, index) => {
    if (!/^(https?:\/\/|www\.)/i.test(part)) return part
    const href = part.startsWith("http") ? part : `https://${part}`
    return <a key={`${index}-${part}`} href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2">{part}</a>
  })
}

export default function AdminClassroomPage() {
  const params = useParams<{ course: string }>()
  const courseSlug = params.course
  const course = COURSE_CATALOG.find((item) => item.slug === courseSlug)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState("")
  const [displayName, setDisplayName] = useState("")
  const { theme, toggleTheme } = useAdminTheme()
  const dark = theme === "dark"
  const [onlineCount, setOnlineCount] = useState(1)
  const [draft, setDraft] = useState("")
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [openMessageActionsId, setOpenMessageActionsId] = useState<string | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [members, setMembers] = useState<ClassroomMember[]>([])
  const [showMembers, setShowMembers] = useState(false)
  const [showClassMenu, setShowClassMenu] = useState(false)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false)
  const [clearingChat, setClearingChat] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const draftRef = useRef<HTMLTextAreaElement>(null)
  const { newMessageCount, scrollToLatest } = useClassroomChatScroll(
    messages,
    messagesContainerRef,
    !loading,
    (message) => message.sender_user_id === userId,
  )

  const loadMessages = useCallback(async (viewerId: string) => {
    const { data, error: queryError } = await supabase
      .from("classroom_messages")
      .select("id,course_slug,sender_user_id,sender_role,sender_name,content,attachment_path,attachment_name,attachment_mime_type,created_at,reply_to_message_id,edited_at,is_pinned,pinned_at,pinned_by")
      .eq("course_slug", courseSlug)
      .order("created_at", { ascending: true })
      .limit(250)
    if (queryError) throw queryError
    const messageIds = data.map((message) => message.id)
    const parentIds = [...new Set(data.map((message) => message.reply_to_message_id).filter((id): id is string => Boolean(id)))]
    const [reactionResult, parentResult] = await Promise.all([
      messageIds.length
        ? supabase.from("classroom_message_reactions").select("message_id,user_id,emoji").in("message_id", messageIds)
        : Promise.resolve({ data: [], error: null }),
      parentIds.length
        ? supabase.from("classroom_messages").select("id,content,sender_name").in("id", parentIds)
        : Promise.resolve({ data: [], error: null }),
    ])
    if (reactionResult.error) throw reactionResult.error
    if (parentResult.error) throw parentResult.error

    const reactionsByMessage = new Map<string, Array<{ emoji: string; count: number; reacted: boolean }>>()
    for (const reaction of reactionResult.data ?? []) {
      const reactions = reactionsByMessage.get(reaction.message_id) ?? []
      const existing = reactions.find((item) => item.emoji === reaction.emoji)
      if (existing) {
        existing.count += 1
        existing.reacted ||= reaction.user_id === viewerId
      } else {
        reactions.push({ emoji: reaction.emoji, count: 1, reacted: reaction.user_id === viewerId })
      }
      reactionsByMessage.set(reaction.message_id, reactions)
    }
    const parents = new Map((parentResult.data ?? []).map((parent) => [parent.id, parent]))
    const freshMessages = data.map((message) => ({
      ...message,
      reply_to: message.reply_to_message_id ? parents.get(message.reply_to_message_id) ?? null : null,
      reactions: reactionsByMessage.get(message.id) ?? [],
    })) as ChatMessage[]
    setMessages((previous) => {
      const freshIds = new Set(freshMessages.map((message) => message.id))
      return [
        ...freshMessages,
        ...previous.filter((message) => !freshIds.has(message.id)),
      ]
    })
  }, [courseSlug, supabase])

  useEffect(() => {
    if (!course) {
      router.replace("/dashboard/classrooms")
      return
    }
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    void (async () => {
      setError("")
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Your admin session has expired.")
      const { data: currentRole, error: roleError } = await supabase.rpc("classroom_user_role", { p_course_slug: courseSlug })
      if (roleError) {
        console.error("Admin classroom role lookup failed:", roleError)
        throw new Error("Could not check your classroom permissions. Refresh the page and try again.")
      }
      if (currentRole !== "admin") {
        console.error("Signed-in administrator was not recognized by classroom role check:", {
          userId: user.id,
          email: user.email,
          role: currentRole,
        })
        throw new Error("Your admin account is not recognized by classroom access. Sign out and back in, then try again.")
      }
      const { data: name, error: nameError } = await supabase.rpc("classroom_user_name", { p_course_slug: courseSlug })
      if (nameError) throw new Error("Could not load the administrator profile.")
      if (!active) return
      const adminName = typeof name === "string" ? name : user.email ?? "Administrator"
      setUserId(user.id)
      setRole(currentRole)
      setDisplayName(adminName)
      await loadMessages(user.id)
      if (!active) return

      channel = supabase.channel(`classroom:${courseSlug}`, {
        config: { presence: { key: user.id } },
      })
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "classroom_messages",
          filter: `course_slug=eq.${courseSlug}`,
        }, (payload) => {
          const incoming = payload.new as ChatMessage
          if (incoming.reply_to_message_id) {
            void loadMessages(user.id).catch((refreshError) => {
              console.error("Could not load the new classroom reply:", refreshError)
            })
            return
          }
          setMessages((existing) => {
            if (existing.some((message) => message.id === incoming.id)) return existing
            const optimisticIndex = existing.findIndex((message) =>
              message.id.startsWith("temp-") &&
              incoming.sender_user_id === user.id &&
              message.content === incoming.content
            )
            if (optimisticIndex >= 0) {
              const updated = [...existing]
              updated[optimisticIndex] = { ...updated[optimisticIndex], ...incoming }
              return updated
            }
            return [...existing, incoming]
          })
        })
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "classroom_messages",
          filter: `course_slug=eq.${courseSlug}`,
        }, (payload) => {
          const updated = payload.new as ChatMessage
          setMessages((existing) => existing.map((message) => message.id === updated.id
            ? { ...message, ...updated }
            : message))
        })
        .on("postgres_changes", {
          event: "DELETE",
          schema: "public",
          table: "classroom_messages",
        }, (payload) => {
          const deletedId = (payload.old as { id?: string }).id
          if (deletedId) setMessages((existing) => existing.filter((message) => message.id !== deletedId))
        })
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "classroom_message_reactions",
        }, () => {
          void loadMessages(user.id).catch((refreshError) => {
            console.error("Could not refresh classroom reactions:", refreshError)
          })
        })
        .on("presence", { event: "sync" }, () => {
          const presence = channel?.presenceState() ?? {}
          const activeMembers = Object.values(presence).flat().map((member) => ({
            id: member.presence_ref,
            name: "name" in member && typeof member.name === "string" ? member.name : "Class member",
            role: "role" in member && typeof member.role === "string" ? member.role : "member",
          }))
          setMembers(activeMembers)
          setOnlineCount(activeMembers.length)
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel?.track({ name: adminName, role: "admin", online_at: new Date().toISOString() })
            try {
              await announceClassroomJoin(courseSlug, user.id, adminName)
            } catch (announcementError) {
              console.error("Could not record admin classroom entry:", announcementError)
            }
          }
        })
    })().catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Unable to open this classroom.")
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [course, courseSlug, loadMessages, router, supabase])

  const appendEmoji = (emoji: string) => {
    const input = draftRef.current
    const start = input?.selectionStart ?? draft.length
    const end = input?.selectionEnd ?? draft.length
    setDraft(`${draft.slice(0, start)}${emoji}${draft.slice(end)}`)
    requestAnimationFrame(() => {
      if (!input) return
      input.focus()
      const cursor = start + emoji.length
      input.setSelectionRange(cursor, cursor)
    })
  }

  const reactToMessage = async (message: ChatMessage, emoji: string) => {
    setMessages((current) => current.map((item) => item.id === message.id
      ? { ...item, reactions: toggleClassroomReaction(item.reactions ?? [], emoji) }
      : item))
    try {
      const response = await fetch("/api/messages/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, emoji }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to update this reaction.")
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : "Unable to update this reaction.")
      try {
        await loadMessages(userId)
      } catch (refreshError) {
        console.error("Could not restore classroom reactions:", refreshError)
      }
    }
  }

  const togglePinnedMessage = async (message: ChatMessage) => {
    try {
      const response = await fetch("/api/messages/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, isPinned: !message.is_pinned }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to update the pinned message.")
      setMessages((existing) => existing.map((item) => item.id === message.id
        ? { ...item, is_pinned: result.data.is_pinned, pinned_at: result.data.pinned_at, pinned_by: result.data.pinned_by }
        : item))
    } catch (pinError) {
      setError(pinError instanceof Error ? pinError.message : "Unable to update the pinned message.")
    }
  }

  const deleteOwnMessage = async (message: ChatMessage) => {
    if (!window.confirm("Delete this message?")) return
    try {
      const response = await fetch("/api/messages/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to delete this message.")
      setMessages((existing) => existing.filter((item) => item.id !== message.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this message.")
    }
  }

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if ((!draft.trim() && !file) || !userId || !role) return
    setSending(true)
    setError("")
    if (editingMessageId) {
      try {
        const response = await fetch("/api/messages/edit", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: editingMessageId, content: draft }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Unable to edit this message.")
        setEditingMessageId(null)
        setDraft("")
        setReplyingTo(null)
        setOpenMessageActionsId(null)
        await loadMessages(userId)
      } catch (editError) {
        setError(editError instanceof Error ? editError.message : "Unable to edit this message.")
      } finally {
        setSending(false)
      }
      return
    }
    const tempId = `temp-${crypto.randomUUID()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      course_slug: courseSlug,
      sender_user_id: userId,
      sender_role: "admin",
      sender_name: displayName,
      content: draft.trim(),
      attachment_path: null,
      attachment_name: file?.name ?? null,
      attachment_mime_type: file?.type ?? null,
      created_at: new Date().toISOString(),
      reply_to_message_id: replyingTo?.id ?? null,
      reply_to: replyingTo
        ? { id: replyingTo.id, content: replyingTo.content, sender_name: replyingTo.sender_name }
        : null,
      reactions: [],
    }
    setMessages((existing) => [...existing, optimisticMessage])
    let attachmentPath: string | undefined
    try {
      if (file) {
        if (!allowedTypes.has(file.type)) throw new Error("Choose a JPG, PNG, WebP, PDF, or text file.")
        if (file.size > maxFileSize) throw new Error("Files must be 10 MB or smaller.")
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "attachment"
        attachmentPath = `${courseSlug}/${userId}/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from("classroom-files").upload(attachmentPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        })
        if (uploadError) throw uploadError
      }
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: courseSlug,
          content: draft.trim(),
          attachmentPath,
          attachmentName: file?.name,
          attachmentMimeType: file?.type,
          replyToMessageId: replyingTo?.id,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to send message.")
      const savedMessage = result.data as ChatMessage
      setMessages((previous) => {
        const tempIndex = previous.findIndex((message) => message.id === tempId)
        if (tempIndex < 0) return previous.some((message) => message.id === savedMessage.id)
          ? previous
          : [...previous, savedMessage]
        const updated = [...previous]
        updated[tempIndex] = { ...updated[tempIndex], ...savedMessage }
        return updated
      })
      setDraft("")
      setReplyingTo(null)
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (sendError) {
      setMessages((existing) => existing.filter((message) => message.id !== tempId))
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.")
      if (attachmentPath) {
        const { error: cleanupError } = await supabase.storage.from("classroom-files").remove([attachmentPath])
        if (cleanupError) console.error("Failed to remove unlinked classroom attachment:", cleanupError)
      }
    } finally {
      setSending(false)
    }
  }

  const signOut = async () => {
    setSigningOut(true)
    setError("")
    try {
      if (userId) await announceClassroomLeave(courseSlug, userId, displayName)
    } catch (leaveError) {
      console.error("Could not record admin classroom exit:", leaveError)
      setError("Unable to record leaving the classroom. Please try again.")
      setSigningOut(false)
      return
    }
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError("Unable to sign out. Please try again.")
      setSigningOut(false)
      return
    }
    router.replace("/admin-login")
  }

  const leaveClass = async () => {
    setError("")
    try {
      if (userId) await announceClassroomLeave(courseSlug, userId, displayName)
      setShowClassMenu(false)
      router.push("/dashboard/classrooms")
    } catch (leaveError) {
      console.error("Could not record admin classroom exit:", leaveError)
      setError("Unable to record leaving the classroom. Please try again.")
    }
  }

  const clearClassChat = async () => {
    setClearingChat(true)
    setError("")
    try {
      const response = await fetch("/api/messages/clear", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseSlug }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to clear this classroom's chat.")
      setMessages([])
      setDraft("")
      setReplyingTo(null)
      setEditingMessageId(null)
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
      setShowClearChatConfirm(false)
      setShowClassMenu(false)
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Unable to clear this classroom's chat.")
    } finally {
      setClearingChat(false)
    }
  }

  if (!course) return null
  const palette = dark
    ? { page: "bg-[#0b141a] text-[#e9edef]", panel: "bg-[#202c33]", border: "border-[#2a3942]", muted: "text-[#aebac1]", bubble: "bg-[#202c33]" }
    : { page: "bg-[#f0f2f5] text-slate-900", panel: "bg-white", border: "border-slate-200", muted: "text-slate-500", bubble: "bg-white" }

  return (
    <main aria-label={`${course.title} Classroom chat, ${onlineCount} online`} data-classroom-theme={dark ? "dark" : "light"} className={`relative flex h-dvh min-h-0 flex-col overflow-hidden ${palette.page}`}>
      <header className={`z-20 flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-5 ${palette.panel} ${palette.border}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? "bg-[#005c4b] text-emerald-100" : "bg-[#d9fdd3] text-emerald-800"}`}><Users aria-hidden="true" className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{course.title} Classroom</h1>
            <button type="button" onClick={() => setShowMembers(true)} className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${palette.muted} hover:underline`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {onlineCount} online · View members
            </button>
          </div>
        </div>
        <button type="button" onClick={() => setShowClassMenu((open) => !open)} aria-label={showClassMenu ? "Close classroom menu" : "Open classroom menu"} aria-expanded={showClassMenu} className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${palette.muted} hover:bg-black/5`}>
          {showClassMenu ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {error && <p role="alert" className="mx-3 mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800 sm:mx-6">{error}</p>}
        <div
          data-lenis-prevent=""
          ref={messagesContainerRef}
          className="classroom-chat-messages space-y-3 px-3 py-4 sm:px-6"
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
          {loading ? <div className={`flex h-full items-center justify-center text-sm ${palette.muted}`}><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Connecting to class…</div> : messages.length === 0 ? <div className={`flex h-full flex-col items-center justify-center text-center ${palette.muted}`}><Users className="h-8 w-8 opacity-50" /><p className="mt-3 text-sm font-medium">No messages yet</p><p className="mt-1 text-xs">Start the conversation in {course.title}.</p></div> : messages.map((message) => {
            const isMine = message.sender_user_id === userId
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <article className={`group relative max-w-[min(88%,38rem)] rounded-2xl px-3.5 py-2.5 pr-10 shadow-sm ${palette.bubble} ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}>
                  <ClassroomMessageActions
                    open={openMessageActionsId === message.id}
                    isMine={isMine}
                    dark={dark}
                    canPin={role === "admin"}
                    isPinned={message.is_pinned}
                    onToggle={() => setOpenMessageActionsId((current) => current === message.id ? null : message.id)}
                    onReply={() => { setReplyingTo(message); setEditingMessageId(null); setOpenMessageActionsId(null) }}
                    onEdit={() => { setEditingMessageId(message.id); setReplyingTo(null); setDraft(message.content); setOpenMessageActionsId(null) }}
                    onDelete={() => { void deleteOwnMessage(message) }}
                    onTogglePin={() => { void togglePinnedMessage(message) }}
                    onReact={(emoji) => { void reactToMessage(message, emoji) }}
                  />
                  {!isMine && <p className="mb-1 text-[11px] font-semibold text-emerald-700">{message.sender_name} <span className={`font-normal capitalize ${palette.muted}`}>· {message.sender_role}</span></p>}
                  {message.is_pinned && <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600"><Pin className="h-3 w-3" /> Pinned by classroom staff</p>}
                  {message.reply_to && <div className={`mb-2 rounded-lg border-l-[3px] px-2.5 py-1.5 ${dark ? "border-emerald-400/70 bg-black/10" : "border-emerald-700/60 bg-emerald-50"}`}><p className="truncate text-[11px] font-semibold text-emerald-700">{message.reply_to.sender_name}</p><p className={`line-clamp-2 text-xs ${palette.muted}`}>{message.reply_to.content}</p></div>}
                  {message.content && <p className="whitespace-pre-wrap break-words text-sm leading-5">{linkify(message.content)}</p>}
                  {message.attachment_path && message.attachment_name && message.attachment_mime_type && <ClassroomAttachment path={message.attachment_path} name={message.attachment_name} mimeType={message.attachment_mime_type} />}
                  <p className={`mt-1 text-right text-[10px] ${palette.muted}`}>{message.edited_at && <span className="mr-1 italic">edited</span>}{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(message.created_at))}</p>
                  <MessageReactionList reactions={message.reactions ?? []} dark={dark} onReact={(emoji) => { void reactToMessage(message, emoji) }} />
                </article>
              </div>
            )
          })}
        </div>
        <ClassroomNewMessagesButton count={newMessageCount} dark={dark} onClick={() => scrollToLatest()} />
        <form onSubmit={(event) => void send(event)} className={`relative shrink-0 border-t p-3 sm:px-6 ${palette.panel} ${palette.border}`}>
          {showEmoji && <div className="absolute bottom-[calc(100%+0.5rem)] right-3 z-50 w-[min(22rem,calc(100vw-1.5rem))]"><ClassroomEmojiPicker dark={dark} onSelect={(emoji) => { appendEmoji(emoji); setShowEmoji(false) }} /></div>}
          {(replyingTo || editingMessageId) && <div className={`mb-2 flex items-start gap-3 rounded-xl border-l-4 px-3 py-2 ${dark ? "border-emerald-400 bg-[#111b21]" : "border-emerald-700 bg-white"}`}><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-emerald-700">{editingMessageId ? "Editing your message" : `Replying to ${replyingTo?.sender_name ?? "class member"}`}</p><p className={`mt-0.5 line-clamp-2 text-xs ${palette.muted}`}>{editingMessageId ? "Update your message and save." : replyingTo?.content}</p></div><button type="button" aria-label="Cancel reply or edit" onClick={() => { setReplyingTo(null); setEditingMessageId(null); setDraft("") }} className="rounded-lg p-1"><X className="h-4 w-4" /></button></div>}
          {file && <div className={`mb-2 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs ${palette.bubble}`}><span className="truncate">{file.name}</span><button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = "" }} className="font-medium text-rose-600">Remove</button></div>}
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,text/plain" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <button type="button" aria-label="Attach image or file" onClick={() => fileRef.current?.click()} className={`mb-0.5 rounded-xl p-2 ${palette.muted} hover:bg-black/5`}><Paperclip className="h-5 w-5" /></button>
            <textarea ref={draftRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} rows={1} maxLength={5000} placeholder={editingMessageId ? "Edit your message…" : replyingTo ? `Reply to ${replyingTo.sender_name}…` : "Message the class…"} className={`max-h-32 min-h-11 flex-1 resize-y rounded-2xl border px-4 py-3 text-sm outline-none ${palette.border} ${palette.panel}`} />
            <button type="button" onClick={() => setShowEmoji((open) => !open)} aria-label="Open emoji picker" aria-expanded={showEmoji} title="Emoji" className={`mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-amber-500 ${palette.panel} hover:bg-amber-50`}><Smile className="h-5 w-5" /></button>
            <button type="submit" disabled={sending || (!draft.trim() && !file)} aria-label="Send message" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50">{sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </div>
          <p className={`mt-2 text-[10px] ${palette.muted}`}>{displayName || "Administrator"} · Attachments up to 10 MB</p>
        </form>
      </div>
      {showClassMenu && (
        <>
          <button type="button" aria-label="Close classroom menu" onClick={() => setShowClassMenu(false)} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <aside aria-label="Classroom menu" className={`absolute right-0 top-16 z-50 flex h-[calc(100%-4rem)] w-[min(22rem,90vw)] flex-col border-l p-4 shadow-2xl ${palette.panel} ${palette.border}`}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Classroom</p>
            <p className="mt-1 px-2 text-sm font-semibold">{course.title} group</p>
            <button type="button" onClick={() => { setShowMembers(true); setShowClassMenu(false) }} className={`mt-5 flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-black/5 ${palette.muted}`}>
              <Users aria-hidden="true" className="h-4 w-4" /> Members · {members.length} online
            </button>
            <button type="button" onClick={toggleTheme} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-black/5 ${palette.muted}`}>
              {dark ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
              Switch to {dark ? "light" : "dark"} mode
            </button>
            {role === "admin" && <button type="button" onClick={() => { setShowClassMenu(false); setShowClearChatConfirm(true) }} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm text-rose-600 hover:bg-rose-50">
              <Trash2 aria-hidden="true" className="h-4 w-4" /> Clear all chat history
            </button>}
            <div className={`mt-auto border-t pt-3 ${palette.border}`}>
              <button type="button" onClick={() => void leaveClass()} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-black/5 ${palette.muted}`}>
                <Users aria-hidden="true" className="h-4 w-4" /> Exit class
              </button>
              <button type="button" onClick={() => { setShowClassMenu(false); setShowSignoutConfirm(true) }} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-rose-600 hover:bg-rose-50">
                <LogOut aria-hidden="true" className="h-4 w-4" /> Sign out
              </button>
            </div>
          </aside>
        </>
      )}
      {showMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMembers(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="class-members-title" className={`w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${palette.panel}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${palette.border}`}>
              <div><h2 id="class-members-title" className="text-base font-semibold">{course.title} members</h2><p className={`mt-1 text-xs ${palette.muted}`}>{onlineCount} currently online</p></div>
              <button type="button" onClick={() => setShowMembers(false)} aria-label="Close members" className={`rounded-lg p-2 ${palette.muted}`}><X className="h-4 w-4" /></button>
            </div>
            <ul className="max-h-[60dvh] overflow-y-auto p-2">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${dark ? "bg-[#005c4b] text-emerald-100" : "bg-[#d9fdd3] text-emerald-800"}`}><Users aria-hidden="true" className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{member.name}</span><span className={`block text-xs capitalize ${palette.muted}`}>{member.role}</span></span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Online" />
                </li>
              ))}
              {members.length === 0 && <li className={`px-3 py-8 text-center text-sm ${palette.muted}`}>No one is online right now.</li>}
            </ul>
          </section>
        </div>
      )}
      {showSignoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="class-signout-title" className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl ${palette.panel}`}>
            <h2 id="class-signout-title" className="text-base font-semibold">Sign out of your account?</h2>
            <p className={`mt-2 text-sm ${palette.muted}`}>You will leave the {course.title} classroom.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={signingOut} onClick={() => setShowSignoutConfirm(false)} className={`min-h-10 rounded-xl px-4 text-sm ${palette.muted}`}>Cancel</button>
              <button type="button" disabled={signingOut} onClick={() => void signOut()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-60">{signingOut && <LoaderCircle className="h-4 w-4 animate-spin" />}Sign out</button>
            </div>
          </section>
        </div>
      )}
      {showClearChatConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="clear-chat-title" aria-describedby="clear-chat-description" className={`w-full max-w-md rounded-2xl p-5 shadow-2xl ${palette.panel}`}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700"><Trash2 aria-hidden="true" className="h-5 w-5" /></span>
              <div>
                <h2 id="clear-chat-title" className="text-base font-semibold">Permanently clear {course.title} chat?</h2>
                <p id="clear-chat-description" className={`mt-2 text-sm ${palette.muted}`}>This deletes every message and reaction for this class from the database, including messages from students and staff. Attached chat files will also be removed. This cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button type="button" disabled={clearingChat} onClick={() => setShowClearChatConfirm(false)} className={`min-h-10 rounded-xl px-4 text-sm ${palette.muted}`}>Cancel</button>
              <button type="button" disabled={clearingChat} onClick={() => void clearClassChat()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                {clearingChat && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {clearingChat ? "Clearing chat…" : "Delete all chat history"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
