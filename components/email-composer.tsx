"use client"

import { useEffect, useRef, useState } from "react"
import { Bold, ImagePlus, Italic, Link2, List, ListOrdered, Redo2, Strikethrough, Underline, Undo2 } from "lucide-react"
import { Button } from "@/app/dashboard/components/ui/button"
import { Input } from "@/app/dashboard/components/ui/input"
import { Label } from "@/app/dashboard/components/ui/label"
import { sanitizeEmailHtml } from "@/lib/email/sanitize"

type Props = {
  value: string
  onChange: (value: string) => void
}

const tools = [
  ["bold", Bold, "Bold"], ["italic", Italic, "Italic"], ["underline", Underline, "Underline"],
  ["strikeThrough", Strikethrough, "Strikethrough"], ["insertUnorderedList", List, "Bullet list"],
  ["insertOrderedList", ListOrdered, "Numbered list"], ["undo", Undo2, "Undo"], ["redo", Redo2, "Redo"],
] as const

export function EmailComposer({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value
  }, [value])

  const update = () => {
    if (editorRef.current) onChange(sanitizeEmailHtml(editorRef.current.innerHTML))
  }
  const command = (name: string, argument?: string) => {
    editorRef.current?.focus()
    document.execCommand(name, false, argument)
    update()
  }
  const insertLink = () => {
    if (!linkUrl.trim()) return
    editorRef.current?.focus()
    const selection = window.getSelection()
    if (selection?.isCollapsed && linkText.trim()) {
      document.execCommand("insertHTML", false, `<a href="${escapeHtmlAttribute(linkUrl.trim())}">${escapeHtml(linkText.trim())}</a>`)
    } else {
      document.execCommand("createLink", false, linkUrl.trim())
    }

    function escapeHtml(value: string) {
      return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    }

    function escapeHtmlAttribute(value: string) {
      return escapeHtml(value).replaceAll("'", "&#39;")
    }
    setLinkOpen(false)
    setLinkText("")
    setLinkUrl("")
    update()
  }
  const insertImage = (url: string) => {
    editorRef.current?.focus()
    document.execCommand("insertImage", false, url)
    update()
  }
  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("/api/admin/email-assets", { method: "POST", body: formData })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Unable to upload image.")
    insertImage(result.url)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow focus-within:border-emerald-300 focus-within:shadow-md">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-[#f7faf8] p-2.5">
        <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-sm">
          {tools.slice(0, 4).map(([name, Icon, label]) => (
            <button key={name} type="button" aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={() => command(name)} className="rounded-lg p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <select aria-label="Text style" defaultValue="p" onChange={(event) => command("formatBlock", event.target.value)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm outline-none focus:border-emerald-400">
          <option value="p">Paragraph</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option>
        </select>
        <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-sm">
          {tools.slice(4).map(([name, Icon, label]) => (
            <button key={name} type="button" aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={() => command(name)} className="rounded-lg p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-0.5">
          <button type="button" title="Insert link" onClick={() => setLinkOpen(true)} className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-emerald-700"><Link2 className="h-4 w-4" /></button>
          <button type="button" title="Insert image URL" onClick={() => { const url = window.prompt("Image URL"); if (url) insertImage(url) }} className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-emerald-700"><ImagePlus className="h-4 w-4" /></button>
          <button type="button" title="Upload image" onClick={() => fileRef.current?.click()} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-white">Upload</button>
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file).catch((error) => window.alert(error instanceof Error ? error.message : "Unable to upload image.")); event.target.value = "" }} />
      </div>
      {linkOpen && (
        <div className="grid gap-2 border-b border-slate-200 bg-emerald-50/50 p-3 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
          <div><Label htmlFor="link-text" className="text-xs">Display text</Label><Input id="link-text" value={linkText} onChange={(event) => setLinkText(event.target.value)} placeholder="Selected text" className="mt-1 h-9 bg-white text-sm" /></div>
          <div><Label htmlFor="link-url" className="text-xs">URL</Label><Input id="link-url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" className="mt-1 h-9 bg-white text-sm" /></div>
          <div className="flex gap-2"><Button type="button" size="sm" onClick={insertLink}>Insert link</Button><Button type="button" size="sm" variant="outline" onClick={() => { editorRef.current?.focus(); document.execCommand("unlink"); update(); setLinkOpen(false) }}>Remove</Button></div>
        </div>
      )}
      <div className="bg-[#fafafa] p-3 sm:p-4">
        <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-label="Email body" data-placeholder="Write your email…" onInput={update} onBlur={update} className="email-editor mx-auto min-h-[440px] w-full max-w-[600px] rounded-lg bg-white px-5 py-6 font-[Arial,Helvetica,sans-serif] text-[15px] leading-[1.75] text-[#34443a] shadow-sm outline-none sm:px-7 sm:py-8" />
      </div>
      <p className="border-t border-slate-100 bg-white px-4 py-2.5 text-[11px] text-slate-400">Paste formatted content directly. Supported formatting is kept safe for email delivery.</p>
    </div>
  )
}
