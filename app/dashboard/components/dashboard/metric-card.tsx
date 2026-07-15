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
    <Card className="dashboard-card stat-card">
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between mb-1.5 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{title}</span>
          <div className="p-1.5 sm:p-2 bg-amber-500/10 text-amber-600 rounded-lg transition-all duration-300 shrink-0 ml-2">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">{value}</p>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}