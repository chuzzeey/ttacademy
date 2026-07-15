import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-5 sm:mb-7">
      <div className="space-y-0.5 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">{children}</div>}
    </div>
  )
}