import { Card, CardContent } from "../ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
}

export function MetricCard({ title, value, icon: Icon, description }: MetricCardProps) {
  return (
    <Card className="group bg-card border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{title}</span>
          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
