"use client"

import type { ReactNode } from "react"
import { Check, CheckCheck, Clock, Pin } from "lucide-react"
import { ClassroomAttachment } from "@/components/classroom-attachment"
import { ClassroomMessageActions, MessageReactionList } from "@/components/classroom-message-actions"

export type ClassroomBubbleMessage = {
  id: string
  text: string
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read"
  senderName?: string
  senderRole?: "admin" | "teacher" | "student"
  attachmentPath?: string
  attachmentName?: string
  attachmentMimeType?: string
  replyToMessageId?: string
  replyTo?: { id: string; content: string; sender_name: string }
  editedAt?: string
  isPinned?: boolean
  reactions?: Array<{ emoji: string; count: number; reacted: boolean }>
}

type ClassroomMessageBubbleProps = {
  message: ClassroomBubbleMessage
  isMine: boolean
  isSystem?: boolean
  senderLabel?: string
  adminStyle?: boolean
  time: string
  content: ReactNode
  dark?: boolean
  actionsOpen: boolean
  onToggleActions: () => void
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  canPin?: boolean
  onTogglePin?: () => void
  onReact: (emoji: string) => void
}

export function ClassroomMessageBubble({
  message,
  isMine,
  isSystem = false,
  senderLabel,
  adminStyle = false,
  time,
  content,
  dark = false,
  actionsOpen,
  onToggleActions,
  onReply,
  onEdit,
  onDelete,
  canPin = false,
  onTogglePin,
  onReact,
}: ClassroomMessageBubbleProps) {
  const canInteract = !isSystem && !message.id.startsWith("temp-")
  const bubbleColor = adminStyle
    ? dark ? "bg-[#202c33] text-[#e9edef]" : "bg-white text-[#111b21]"
    : isMine
      ? dark ? "bg-[#005c4b] text-[#e9edef]" : "bg-[#d9fdd3] text-[#111b21]"
      : dark ? "bg-[#202c33] text-[#e9edef]" : "bg-white text-[#111b21]"

  return (
    <div
      className={`${adminStyle ? "mb-0" : "mb-2"} flex ${isMine ? "justify-end" : "justify-start"}`}
      onContextMenu={(event) => {
        if (!canInteract) return
        event.preventDefault()
        onToggleActions()
      }}
    >
      <div className={`group relative ${adminStyle ? "max-w-[min(88%,38rem)]" : "max-w-[88%] sm:max-w-[72%]"}`}>
        {!adminStyle && senderLabel && !isMine && !isSystem && (
          <p className="mb-1 ml-2 text-[11px] font-semibold text-emerald-700">{senderLabel}</p>
        )}
        <article className={`relative rounded-2xl px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,.10)] ${adminStyle ? isMine ? "rounded-br-md" : "rounded-bl-md" : isMine ? "rounded-tr-sm" : "rounded-tl-sm"} ${adminStyle ? "pr-10" : ""} ${bubbleColor}`}>
          {canInteract && (
            <ClassroomMessageActions
              open={actionsOpen}
              isMine={isMine}
              dark={dark}
              onToggle={onToggleActions}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              canPin={canPin}
              isPinned={message.isPinned}
              onTogglePin={onTogglePin}
              onReact={onReact}
            />
          )}
          {adminStyle && senderLabel && !isMine && !isSystem && (
            <p className="mb-1 text-[11px] font-semibold text-emerald-700">
              {senderLabel}
              {message.senderRole && <span className={`font-normal capitalize ${dark ? "text-[#aebac1]" : "text-slate-500"}`}> · {message.senderRole}</span>}
            </p>
          )}
          {message.isPinned && (
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <Pin className="h-3 w-3" /> Pinned by classroom staff
            </p>
          )}
          {message.replyTo && (
            <div className={`mb-2 rounded-lg border-l-[3px] px-2.5 py-1.5 ${isMine ? "border-emerald-700/60 bg-black/[0.06]" : dark ? "border-emerald-400/70 bg-black/10" : "border-emerald-700/60 bg-emerald-50"}`}>
              <p className="truncate text-[11px] font-semibold text-emerald-700">{message.replyTo.sender_name}</p>
              <p className={`line-clamp-2 text-xs ${dark && !isMine ? "text-[#aebac1]" : "text-slate-600"}`}>{message.replyTo.content}</p>
            </div>
          )}
          {message.attachmentPath && message.attachmentName && message.attachmentMimeType && (
            <ClassroomAttachment path={message.attachmentPath} name={message.attachmentName} mimeType={message.attachmentMimeType} />
          )}
          {message.text && <div className="break-words whitespace-pre-wrap text-[14px] leading-5">{content}</div>}
          <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${dark ? "text-[#aebac1]" : "text-slate-500"}`}>
            {message.editedAt && <span className="mr-1 italic">edited</span>}
            <span>{time}</span>
            {isMine && !adminStyle && (message.status === "sending"
              ? <Clock className="h-3.5 w-3.5" />
              : message.status === "read"
                ? <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                : <Check className="h-3.5 w-3.5" />)}
          </div>
        </article>
        <MessageReactionList reactions={message.reactions ?? []} dark={dark} onReact={onReact} />
      </div>
    </div>
  )
}
