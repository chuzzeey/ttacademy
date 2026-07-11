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
    <Card className="dashboard-card cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm text-foreground transition-colors">{title}</span>
          <div className="p-2 bg-muted text-muted-foreground rounded-lg transition-all duration-300">
            <Icon className="w-4 h-4 transition-colors" />
          </div>
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-foreground/80 mt-1 transition-colors">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
