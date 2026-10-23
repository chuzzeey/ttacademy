import { Headphones, MessageCircle } from 'lucide-react'

const supportMessage = encodeURIComponent(
  'Hello Tech Trailblazer Academy, I’m reaching out from your website and would like some assistance.',
)

function LiveSupport() {
  return (
    <a
      href={`https://wa.me/2348034826276?text=${supportMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Tech Trailblazer Academy support on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] inline-flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_12px_36px_-16px_rgba(15,23,42,0.38)] transition hover:-translate-y-0.5 hover:border-[#25D366] hover:shadow-[0_16px_42px_-16px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-7 sm:right-7"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#168c46]">
        <Headphones aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
        <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#25D366]" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold leading-5 text-slate-900">Need help?</span>
        <span className="inline-flex items-center gap-1 text-xs leading-5 text-slate-500">
          <MessageCircle aria-hidden="true" className="h-3 w-3 text-[#168c46]" />
          Chat with support
        </span>
      </span>
    </a>
  )
}

export default LiveSupport
