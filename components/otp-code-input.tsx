"use client"

import { ClipboardEvent, KeyboardEvent, useRef } from "react"

type OtpCodeInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpCodeInput({ value, onChange, disabled = false }: OtpCodeInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  const updateFrom = (startIndex: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 6)
    if (!digits) {
      const next = value.split("")
      next[startIndex] = ""
      onChange(next.join("").slice(0, 6))
      return
    }

    if (digits.length > 1) {
      const next = value.split("")
      digits.split("").forEach((digit, offset) => {
        if (startIndex + offset < 6) next[startIndex + offset] = digit
      })
      onChange(next.join("").slice(0, 6))
      inputs.current[Math.min(startIndex + digits.length, 5)]?.focus()
      return
    }

    const next = value.split("")
    next[startIndex] = digits
    onChange(next.join("").slice(0, 6))
    if (startIndex < 5) inputs.current[startIndex + 1]?.focus()
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    const pasted = event.clipboardData.getData("text")
    if (!/\d/.test(pasted)) return
    event.preventDefault()
    updateFrom(index, pasted)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      inputs.current[index - 1]?.focus()
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault()
      inputs.current[index + 1]?.focus()
    }
  }

  return (
    <div role="group" aria-label="Six-digit email code" className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(element) => { inputs.current[index] = element }}
          aria-label={`Digit ${index + 1} of 6`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={index === 0 ? 6 : 1}
          value={value[index] ?? ""}
          disabled={disabled}
          onChange={(event) => updateFrom(index, event.target.value)}
          onPaste={(event) => handlePaste(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center font-mono text-lg font-semibold text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:bg-slate-50 sm:h-14 sm:w-12 sm:text-xl"
        />
      ))}
    </div>
  )
}
