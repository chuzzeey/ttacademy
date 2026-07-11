import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
