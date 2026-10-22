"use client"

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle, Moon, Paperclip, Send, Sun, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { COURSE_CATALOG } from "@/lib/course-catalog"
import { ClassroomAttachment } from "@/components/classroom-attachment"
import { useClassroomTheme } from "@/lib/hooks/use-classroom-theme"

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
  const { dark, setDark } = useClassroomTheme(courseSlug)
  const [onlineCount, setOnlineCount] = useState(1)
  const [draft, setDraft] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadMessages = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("classroom_messages")
      .select("id,course_slug,sender_user_id,sender_role,sender_name,content,attachment_path,attachment_name,attachment_mime_type,created_at")
      .eq("course_slug", courseSlug)
      .order("created_at", { ascending: true })
      .limit(250)
    if (queryError) throw queryError
    setMessages(data as ChatMessage[])
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
      setUserId(user.id)
      setRole(currentRole)
      setDisplayName(typeof name === "string" ? name : user.email ?? "Administrator")
      await loadMessages()
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
          setMessages((existing) => existing.some((message) => message.id === incoming.id) ? existing : [...existing, incoming])
        })
        .on("presence", { event: "sync" }, () => {
          const presence = channel?.presenceState() ?? {}
          setOnlineCount(Math.max(1, Object.values(presence).reduce((total, users) => total + users.length, 0)))
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel?.track({ name: typeof name === "string" ? name : user.email, role: "admin", online_at: new Date().toISOString() })
            const response = await fetch("/api/messages/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ course: courseSlug, content: "Admin joined the class." }),
            })
            if (!response.ok) console.error("Could not record admin classroom entry:", await response.text())
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if ((!draft.trim() && !file) || !userId || !role) return
    setSending(true)
    setError("")
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
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to send message.")
      setDraft("")
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.")
      if (attachmentPath) {
        const { error: cleanupError } = await supabase.storage.from("classroom-files").remove([attachmentPath])
        if (cleanupError) console.error("Failed to remove unlinked classroom attachment:", cleanupError)
      }
    } finally {
      setSending(false)
    }
  }

  if (!course) return null
  const palette = dark
    ? { page: "bg-[#0b141a] text-[#e9edef]", panel: "bg-[#202c33]", border: "border-[#2a3942]", muted: "text-[#aebac1]", bubble: "bg-[#202c33]" }
    : { page: "bg-[#f0f2f5] text-slate-900", panel: "bg-white", border: "border-slate-200", muted: "text-slate-500", bubble: "bg-white" }

  return (
    <main data-classroom-theme={dark ? "dark" : "light"} className={`-mx-3 -mt-[5rem] flex h-[calc(100dvh-4.25rem)] min-h-[520px] flex-col sm:-mx-6 lg:-mx-8 lg:-mt-24 lg:h-[calc(100dvh-6rem)] ${palette.page}`}>
      <header className={`flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-6 ${palette.panel} ${palette.border}`}>
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" aria-label="Back to classroom management" onClick={() => router.push("/dashboard/classrooms")} className={`rounded-xl p-2 hover:bg-black/5 ${palette.muted}`}><ArrowLeft className="h-5 w-5" /></button>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? "bg-[#005c4b] text-emerald-100" : "bg-[#d9fdd3] text-emerald-800"}`}><Users className="h-5 w-5" /></div>
          <div className="min-w-0"><h1 className="truncate text-sm font-semibold">{course.title} Classroom</h1><p className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${palette.muted}`}><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Group chat · {onlineCount} online · Admin</p></div>
        </div>
        <button type="button" onClick={() => setDark((value) => !value)} aria-label={dark ? "Switch this class to light mode" : "Switch this class to dark mode"} aria-pressed={dark} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${dark ? "border-[#2a3942] bg-[#111b21] text-[#e9edef] hover:bg-[#2a3942]" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{dark ? "Light mode" : "Dark mode"}</button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        {error && <p role="alert" className="mx-3 mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800 sm:mx-6">{error}</p>}
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-6">
          {loading ? <div className={`flex h-full items-center justify-center text-sm ${palette.muted}`}><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Connecting to class…</div> : messages.length === 0 ? <div className={`flex h-full flex-col items-center justify-center text-center ${palette.muted}`}><Users className="h-8 w-8 opacity-50" /><p className="mt-3 text-sm font-medium">No messages yet</p><p className="mt-1 text-xs">Start the conversation in {course.title}.</p></div> : messages.map((message) => {
            const isMine = message.sender_user_id === userId
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <article className={`max-w-[min(88%,38rem)] rounded-2xl px-3.5 py-2.5 shadow-sm ${palette.bubble} ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}>
                  {!isMine && <p className="mb-1 text-[11px] font-semibold text-emerald-700">{message.sender_name} <span className={`font-normal capitalize ${palette.muted}`}>· {message.sender_role}</span></p>}
                  {message.content && <p className="whitespace-pre-wrap break-words text-sm leading-5">{linkify(message.content)}</p>}
                  {message.attachment_path && message.attachment_name && message.attachment_mime_type && <ClassroomAttachment path={message.attachment_path} name={message.attachment_name} mimeType={message.attachment_mime_type} />}
                  <p className={`mt-1 text-right text-[10px] ${palette.muted}`}>{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(message.created_at))}</p>
                </article>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={(event) => void send(event)} className={`shrink-0 border-t p-3 sm:px-6 ${palette.panel} ${palette.border}`}>
          {file && <div className={`mb-2 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs ${palette.bubble}`}><span className="truncate">{file.name}</span><button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = "" }} className="font-medium text-rose-600">Remove</button></div>}
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,text/plain" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <button type="button" aria-label="Attach image or file" onClick={() => fileRef.current?.click()} className={`mb-0.5 rounded-xl p-2 ${palette.muted} hover:bg-black/5`}><Paperclip className="h-5 w-5" /></button>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} rows={1} maxLength={5000} placeholder="Message the class…" className={`max-h-32 min-h-11 flex-1 resize-y rounded-2xl border px-4 py-3 text-sm outline-none ${palette.border} ${palette.panel}`} />
            <button type="submit" disabled={sending || (!draft.trim() && !file)} aria-label="Send message" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50">{sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </div>
          <p className={`mt-2 text-[10px] ${palette.muted}`}>{displayName || "Administrator"} · Attachments up to 10 MB</p>
        </form>
      </div>
    </main>
  )
}
