import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-2 sm:mb-7 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:gap-3">{children}</div>}
    </div>
  )
}