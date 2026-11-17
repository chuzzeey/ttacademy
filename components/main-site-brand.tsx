import Image from 'next/image'

export default function MainSiteBrand({ priority = false }: { priority?: boolean }) {
  return (
    <a
      href="#home"
      aria-label="Tech Trailblazer Academy home"
      className="inline-flex items-center text-inherit no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <Image
        src="/main-site-logo.webp"
        alt="Tech Trailblazer Academy"
        width={760}
        height={185}
        className="h-auto w-[170px] sm:w-[190px]"
        unoptimized
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </a>
  )
}
