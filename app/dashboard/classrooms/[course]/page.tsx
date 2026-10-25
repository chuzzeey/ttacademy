"use client"

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoaderCircle, LogOut, Menu, Moon, Paperclip, Send, Sun, Users, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { COURSE_CATALOG } from "@/lib/course-catalog"
import { ClassroomAttachment } from "@/components/classroom-attachment"
import { useAdminTheme } from "@/app/dashboard/components/dashboard/admin-theme-provider"

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
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [members, setMembers] = useState<ClassroomMember[]>([])
  const [showMembers, setShowMembers] = useState(false)
  const [showClassMenu, setShowClassMenu] = useState(false)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
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
            await channel?.track({ name: typeof name === "string" ? name : user.email, role: "admin", online_at: new Date().toISOString() })
            const response = await fetch("/api/messages/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ course: courseSlug, content: `${displayName} joined the class.` }),
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
    const messagesContainer = messagesContainerRef.current
    messagesContainer?.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    })
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

  const signOut = async () => {
    setSigningOut(true)
    setError("")
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError("Unable to sign out. Please try again.")
      setSigningOut(false)
      return
    }
    router.replace("/admin-login")
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
                <article className={`max-w-[min(88%,38rem)] rounded-2xl px-3.5 py-2.5 shadow-sm ${palette.bubble} ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}>
                  {!isMine && <p className="mb-1 text-[11px] font-semibold text-emerald-700">{message.sender_name} <span className={`font-normal capitalize ${palette.muted}`}>· {message.sender_role}</span></p>}
                  {message.content && <p className="whitespace-pre-wrap break-words text-sm leading-5">{linkify(message.content)}</p>}
                  {message.attachment_path && message.attachment_name && message.attachment_mime_type && <ClassroomAttachment path={message.attachment_path} name={message.attachment_name} mimeType={message.attachment_mime_type} />}
                  <p className={`mt-1 text-right text-[10px] ${palette.muted}`}>{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(message.created_at))}</p>
                </article>
              </div>
            )
          })}
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
      {showClassMenu && (
        <>
          <button type="button" aria-label="Close classroom menu" onClick={() => setShowClassMenu(false)} className="fixed inset-0 z-30 bg-black/25" />
          <aside aria-label="Classroom menu" className={`absolute right-0 top-16 z-40 flex h-[calc(100%-4rem)] w-[min(22rem,90vw)] flex-col border-l p-4 shadow-2xl ${palette.panel} ${palette.border}`}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Classroom</p>
            <p className="mt-1 px-2 text-sm font-semibold">{course.title} group</p>
            <button type="button" onClick={() => { setShowMembers(true); setShowClassMenu(false) }} className={`mt-5 flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-black/5 ${palette.muted}`}>
              <Users aria-hidden="true" className="h-4 w-4" /> Members · {members.length} online
            </button>
            <button type="button" onClick={toggleTheme} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-black/5 ${palette.muted}`}>
              {dark ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
              Switch to {dark ? "light" : "dark"} mode
            </button>
            <div className={`mt-auto border-t pt-3 ${palette.border}`}>
              <button type="button" onClick={() => { setShowClassMenu(false); router.push("/dashboard/classrooms") }} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-black/5 ${palette.muted}`}>
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
    </main>
  )
}
