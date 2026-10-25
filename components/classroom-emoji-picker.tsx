"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

const emojiCategories = {
  "Smileys": ["😀","😃","😄","😁","😆","😅","😂","🤣","🥲","😊","😇","🙂","🙃","😉","😍","🥰","😘","😋","😛","🤪","🤔","🫡","🤫","🤭","😐","😑","😶","🙄","😏","😒","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","😵","🤯","🥳","😎","😭","😤","😡","🤗","🤝","🙏"],
  "People": ["👋","🤚","🖐️","✋","🫱","🫲","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","👏","🙌","👐","🤲","💪","🦾","🧠","👀","👁️","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","💖","💯"],
  "Nature": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐧","🐦","🦋","🐝","🐞","🐢","🐬","🐳","🦈","🦉","🦄","🌱","🌿","🍀","🌵","🌴","🌳","🌲","🌷","🌹","🌻","🌼","🌙","⭐","🌟","☀️","🌈","☁️","🔥","💧","🌊"],
  "Food": ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍆","🥦","🥕","🌽","🌶️","🥒","🥬","🥔","🍞","🥐","🧀","🥚","🍳","🥞","🧇","🥓","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🍜","🍣","🍱","🍰","🎂","🍪","🍩","☕"],
  "Activity": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🥊","🥋","⛳","⛸️","🎣","🤿","🎽","🎿","🛷","🏋️","🤸","🤾","🏌️","🧘","🏄","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🎯","🎮","🕹️","🎲","🧩","🎨","🎤","🎧","🎼","🎹","🥁","🎷","🎸","🎻","🎬","🎉"],
  "Travel": ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚚","🚲","🛴","🚏","🛣️","🚦","🚥","✈️","🛫","🛬","🚀","🛸","🚁","🚢","⛵","🚤","🛶","🚉","🚆","🚇","🚊","🚞","🚝","🏠","🏡","🏢","🏬","🏥","🏫","🏰","🗼","🌍","🌎","🌏","🏖️","🏕️","⛰️","🌋","🗺️","🧭","🛤️"],
  "Objects": ["⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","💽","💾","💿","📷","📸","📹","🎥","📞","☎️","📺","📻","🎙️","🎚️","🔋","🪫","🔌","💡","🔦","🕯️","🧯","🛢️","💸","💵","💳","🧾","✉️","📩","📦","📚","📖","📝","✏️","📌","📍","🔒","🔑","🛠️","⚙️","🔧","🧰","🧪","🔬","🧲"],
  "Symbols": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💯","✅","☑️","✔️","❌","❎","➕","➖","➗","✖️","♾️","‼️","⁉️","❓","❗","💬","💭","🗯️","💤","🔔","🔕","🎵","🎶","🔊","🔇","♻️","⚠️","🚫","⛔","🔞","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","⬆️","➡️","⬇️"],
} as const

type Category = keyof typeof emojiCategories

type ClassroomEmojiPickerProps = {
  onSelect: (emoji: string) => void
  dark?: boolean
}

export function ClassroomEmojiPicker({ onSelect, dark = false }: ClassroomEmojiPickerProps) {
  const [category, setCategory] = useState<Category>("Smileys")
  const [search, setSearch] = useState("")
  const emojis = useMemo(() => {
    if (!search.trim()) return emojiCategories[category]
    return Object.values(emojiCategories).flat().filter((emoji) => emoji.includes(search.trim()))
  }, [category, search])

  return (
    <section aria-label="Emoji picker" className={`w-full overflow-hidden rounded-2xl border shadow-xl ${dark ? "border-[#2a3942] bg-[#202c33]" : "border-gray-200 bg-white"}`}>
      <div className={`flex items-center gap-2 border-b px-3 py-2 ${dark ? "border-[#2a3942]" : "border-gray-100"}`}>
        <Search aria-hidden="true" className={`h-4 w-4 shrink-0 ${dark ? "text-[#8696a0]" : "text-[#667781]"}`} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search emojis" aria-label="Search emojis" className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${dark ? "text-[#e9edef] placeholder:text-[#8696a0]" : "text-[#111b21] placeholder:text-[#8696a0]"}`} />
      </div>
      {!search && (
        <div role="tablist" aria-label="Emoji categories" className={`flex gap-1 overflow-x-auto border-b p-1.5 ${dark ? "border-[#2a3942]" : "border-gray-100"}`}>
          {(Object.keys(emojiCategories) as Category[]).map((item) => (
            <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`shrink-0 rounded-lg px-2 py-1.5 text-[11px] font-medium ${category === item ? "bg-emerald-700 text-white" : dark ? "text-[#aebac1] hover:bg-[#2a3942]" : "text-[#667781] hover:bg-gray-100"}`}>{item}</button>
          ))}
        </div>
      )}
      <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto p-2 sm:grid-cols-10">
        {emojis.map((emoji, index) => (
          <button key={`${emoji}-${index}`} type="button" onClick={() => onSelect(emoji)} aria-label={`Insert ${emoji}`} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xl transition ${dark ? "hover:bg-[#2a3942]" : "hover:bg-gray-100"}`}>{emoji}</button>
        ))}
        {emojis.length === 0 && <p className={`col-span-full py-5 text-center text-xs ${dark ? "text-[#aebac1]" : "text-[#667781]"}`}>No emojis found.</p>}
      </div>
    </section>
  )
}
