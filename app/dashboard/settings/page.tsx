import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Globe } from "lucide-react"

export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <PageHeader title="Settings" description="Review workspace configuration and manage account preferences." />

      <Card className="dashboard-card scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-emerald-700" /> Workspace configuration</CardTitle>
          <CardDescription>Current application values. These are configured centrally and are not editable here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Academy", value: "Tech Trailblazer Academy" },
            { label: "Analytics timezone", value: "Africa/Lagos" },
            { label: "Dashboard language", value: "English" },
          ].map((setting) => (
            <div key={setting.label} className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{setting.label}</p>
              <p className="mt-1 text-sm font-medium">{setting.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
