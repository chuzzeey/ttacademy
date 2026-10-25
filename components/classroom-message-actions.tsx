"use client"

import { ChevronDown, MessageSquareReply, Pencil, Pin, Trash2 } from "lucide-react"

const quickReactions = ["👍", "😂", "🔥", "🙏"]

type ClassroomMessageActionsProps = {
  open: boolean
  isMine: boolean
  dark?: boolean
  onToggle: () => void
  onReply: () => void
  onEdit?: () => void
  onDelete?: () => void
  canPin?: boolean
  isPinned?: boolean
  onTogglePin?: () => void
  onReact: (emoji: string) => void
}

export function ClassroomMessageActions({
  open,
  isMine,
  dark = false,
  onToggle,
  onReply,
  onEdit,
  onDelete,
  canPin = false,
  isPinned = false,
  onTogglePin,
  onReact,
}: ClassroomMessageActionsProps) {
  return (
    <div className="absolute right-1 top-1 z-20 opacity-100 transition focus-within:opacity-100">
      <button type="button" onClick={onToggle} aria-label="Message options" aria-expanded={open} className={`rounded-md p-1 shadow-sm ${dark ? "bg-[#202c33] text-[#aebac1] hover:bg-[#354650]" : "bg-white/95 text-[#667781] hover:bg-white"}`}>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className={`absolute right-0 top-8 w-52 overflow-hidden rounded-xl border p-1.5 shadow-xl ${dark ? "border-[#354650] bg-[#202c33] text-[#e9edef]" : "border-gray-200 bg-white text-[#111b21]"}`}>
          <div className="flex items-center justify-between gap-0.5 border-b border-current/10 px-1 pb-1.5">
            {quickReactions.map((emoji) => <button key={emoji} type="button" onClick={() => { onReact(emoji); onToggle() }} aria-label={`React ${emoji}`} className={`rounded-md p-1 text-lg transition ${dark ? "hover:bg-[#354650]" : "hover:bg-gray-100"}`}>{emoji}</button>)}
          </div>
          {canPin && onTogglePin && <button type="button" onClick={() => { onTogglePin(); onToggle() }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium ${dark ? "hover:bg-[#2a3942]" : "hover:bg-gray-100"}`}><Pin className="h-3.5 w-3.5" /> {isPinned ? "Unpin message" : "Pin message"}</button>}
          <button type="button" onClick={() => { onReply(); onToggle() }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium ${dark ? "hover:bg-[#2a3942]" : "hover:bg-gray-100"}`}><MessageSquareReply className="h-3.5 w-3.5" /> Reply</button>
          {isMine && onEdit && <button type="button" onClick={() => { onEdit(); onToggle() }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium ${dark ? "hover:bg-[#2a3942]" : "hover:bg-gray-100"}`}><Pencil className="h-3.5 w-3.5" /> Edit message</button>}
          {isMine && onDelete && <button type="button" onClick={() => { onDelete(); onToggle() }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Delete message</button>}
        </div>
      )}
    </div>
  )
}

export type MessageReaction = { emoji: string; count: number; reacted: boolean }

export function MessageReactionList({
  reactions,
  dark = false,
  onReact,
}: {
  reactions: MessageReaction[]
  dark?: boolean
  onReact: (emoji: string) => void
}) {
  if (reactions.length === 0) return null
  const visibleReactions = [...reactions]
    .sort((left, right) => Number(right.reacted) - Number(left.reacted) || right.count - left.count)
  const hiddenCount = Math.max(0, visibleReactions.length - 6)
  return (
    <div className="mt-1 flex w-full max-w-full flex-wrap gap-1 overflow-hidden">
      {visibleReactions.slice(0, 6).map((reaction) => (
        <button key={reaction.emoji} type="button" onClick={() => onReact(reaction.emoji)} className={`inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs shadow-sm ${reaction.reacted ? dark ? "border-emerald-500 bg-[#12372f]" : "border-emerald-500 bg-emerald-50" : dark ? "border-[#354650] bg-[#202c33]" : "border-gray-200 bg-white"}`}>
          <span>{reaction.emoji}</span><span className={dark ? "text-[#e9edef]" : "text-[#667781]"}>{reaction.count}</span>
        </button>
      ))}
      {hiddenCount > 0 && <span aria-label={`${hiddenCount} more reaction types`} className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] ${dark ? "border-[#354650] bg-[#202c33] text-[#aebac1]" : "border-gray-200 bg-white text-[#667781]"}`}>+{hiddenCount}</span>}
    </div>
  )
}
