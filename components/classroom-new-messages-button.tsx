"use client"

import { ChevronDown } from "lucide-react"

export function ClassroomNewMessagesButton({
  count,
  dark = false,
  onClick,
}: {
  count: number
  dark?: boolean
  onClick: () => void
}) {
  if (count === 0) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-24 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition hover:-translate-x-1/2 hover:scale-[1.02] ${
        dark ? "bg-[#202c33] text-[#e9edef]" : "bg-white text-[#111b21]"
      }`}
      aria-label={`${count} new ${count === 1 ? "message" : "messages"}. Jump to latest.`}
    >
      <span>{count} new {count === 1 ? "message" : "messages"}</span>
      <ChevronDown aria-hidden="true" className="h-4 w-4" />
    </button>
  )
}
