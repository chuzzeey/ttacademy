"use client"

import { useEffect, useState } from "react"
import { FileText, LoaderCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function ClassroomAttachment({
  path,
  name,
  mimeType,
}: {
  path: string
  name: string
  mimeType: string
}) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    void createClient().storage.from("classroom-files").createSignedUrl(path, 3600)
      .then(({ data, error: signedUrlError }) => {
        if (!active) return
        if (signedUrlError) setError("Attachment unavailable")
        else setUrl(data.signedUrl)
      })
      .catch(() => {
        if (active) setError("Attachment unavailable")
      })
    return () => { active = false }
  }, [path])

  if (error) return <p className="mt-2 text-xs text-rose-600">{error}</p>
  if (!url) return <p className="mt-2 inline-flex items-center gap-2 text-xs opacity-70"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading attachment…</p>
  if (mimeType.startsWith("image/")) {
    return <a href={url} target="_blank" rel="noreferrer" className="mt-2 block"><img src={url} alt={name} className="max-h-64 max-w-full rounded-xl object-contain" /></a>
  }
  return <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-xs underline-offset-2 hover:underline"><FileText className="h-4 w-4 shrink-0" /><span className="truncate">{name}</span></a>
}
