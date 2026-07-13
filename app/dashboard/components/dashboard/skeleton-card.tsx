import { Card, CardContent } from "../ui/card"

export function SkeletonCard() {
  return (
    <Card className="dashboard-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="h-4 bg-muted/50 rounded animate-pulse w-24" />
          <div className="p-2 bg-muted/30 rounded-lg">
            <div className="w-4 h-4 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-8 bg-muted/50 rounded animate-pulse w-20 mb-2" />
        <div className="h-3 bg-muted/30 rounded animate-pulse w-32" />
      </CardContent>
    </Card>
  )
}