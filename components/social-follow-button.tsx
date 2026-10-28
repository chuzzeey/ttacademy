import { socialLinks } from "@/lib/social-links"

const SocialFollowButton = () => {
  const tiktok = socialLinks.find(({ id }) => id === "tiktok")
  if (!tiktok) return null

  return (
      <a
        href={tiktok.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Tech Trailblazer Academy on TikTok"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 motion-reduce:transform-none"
      >
        <svg className="pointer-events-none h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: tiktok.svg }} />
        Follow us on TikTok
      </a>
  )
}

export default SocialFollowButton