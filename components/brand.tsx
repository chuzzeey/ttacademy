type BrandProps = {
  className?: string
  href?: string | null
}

export default function Brand({ className = '', href = '#home' }: BrandProps) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px_8px_8px_2px] bg-[#b6f238] text-2xl font-bold leading-none text-[#07152f]">
        <span className="-translate-y-px" aria-hidden="true">↘</span>
      </span>
      <span className="font-[Manrope,sans-serif] text-[10px] font-extrabold leading-[.96] tracking-[-.025em] text-[#b6f238]">
        TECH
        <br />
        TRAILBLAZER
        <br />
        <small className="text-[8px]">ACADEMY</small>
      </span>
    </>
  )

  const brandClassName = `inline-flex items-center gap-2.5 text-inherit no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`

  if (href === null) {
    return <div className={brandClassName}>{content}</div>
  }

  return (
    <a
      href={href}
      aria-label="Tech Trailblazer Academy home"
      className={brandClassName}
    >
      {content}
    </a>
  )
}
