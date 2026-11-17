import Image from 'next/image'

export default function MainSiteBrand({
  priority = false,
  size = 'header',
}: {
  priority?: boolean
  size?: 'header' | 'footer'
}) {
  const logoSize =
    size === 'footer'
      ? 'h-auto w-[120px] max-w-full sm:w-[136px] md:w-[150px] lg:w-[164px]'
      : 'h-auto w-[170px] sm:w-[190px]'

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
        className={logoSize}
        unoptimized
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </a>
  )
}
