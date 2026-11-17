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
      ? 'h-auto w-[112px] max-w-full sm:w-[128px] md:w-[144px] lg:w-[160px] mix-blend-multiply'
      : 'h-auto w-[150px] sm:w-[170px] lg:w-[190px]'
  const logo = size === 'footer'
    ? { src: '/footer-logo.webp', width: 720, height: 197 }
    : { src: '/main-site-logo.webp', width: 760, height: 185 }

  return (
    <a
      href="#home"
      aria-label="Tech Trailblazer Academy home"
      className="inline-flex items-center text-inherit no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <Image
        src={logo.src}
        alt="Tech Trailblazer Academy"
        width={logo.width}
        height={logo.height}
        className={logoSize}
        unoptimized
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </a>
  )
}
