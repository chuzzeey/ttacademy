"use client"

import { useState, Suspense } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Search, Plus, Send, Mail, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import Loading from "./loading"

const emailFollowups = [
  {
    id: 1,
    student: "Enoch Chukwudi",
    course: "Fullstack Development",
    subject: "Follow-up on Course Progress",
    status: "Sent",
    sentDate: "Jan 15, 2024",
    type: "Progress Check",
    preview: "Hi Enoch, we noticed you've been making great progress in your Fullstack Development course...",
  },
  {
    id: 2,
    student: "Ngozi Kelechi",
    course: "Frontend Development",
    subject: "Upcoming Assignment Reminder",
    status: "Scheduled",
    sentDate: "Jan 18, 2024",
    type: "Reminder",
    preview: "Dear Ngozi, this is a friendly reminder about your upcoming Frontend Development assignment...",
  },
  {
    id: 3,
    student: "John Abel",
    course: "Backend Development",
    subject: "Course Completion Congratulations",
    status: "Draft",
    sentDate: "-",
    type: "Congratulations",
    preview: "Congratulations John! You've successfully completed the Backend Development course...",
  },
  {
    id: 4,
    student: "Wisdom Nnamdi",
    course: "Fullstack Development",
    subject: "Check-in: How are you finding the course?",
    status: "Sent",
    sentDate: "Jan 13, 2024",
    type: "Check-in",
    preview: "Hi Wisdom, we'd love to hear your feedback on the Fullstack Development course so far...",
  },
  {
    id: 5,
    student: "Sarah Johnson",
    course: "UI/UX Design",
    subject: "New Resources Available",
    status: "Scheduled",
    sentDate: "Jan 20, 2024",
    type: "Resources",
    preview: "Hi Sarah, we've added new UI/UX design resources that we think you'll find valuable...",
  },
  {
    id: 6,
    student: "Michael Chen",
    course: "Frontend Development",
    subject: "Re-engagement: Come back to your course",
    status: "Sent",
    sentDate: "Jan 12, 2024",
    type: "Re-engagement",
    preview: "Hi Michael, we noticed you haven't logged in for a while. We have new content waiting for you...",
  },
  {
    id: 7,
    student: "Emma Wilson",
    course: "Data Science",
    subject: "Project Submission Deadline Approaching",
    status: "Draft",
    sentDate: "-",
    type: "Deadline",
    preview: "Dear Emma, your Data Science project submission deadline is approaching on...",
  },
  {
    id: 8,
    student: "James Brown",
    course: "Backend Development",
    subject: "Personalized Study Recommendations",
    status: "Sent",
    sentDate: "Jan 11, 2024",
    type: "Recommendation",
    preview: "Hi James, based on your progress, we recommend focusing on the following topics...",
  },
]

const emailStats = [
  { name: "Total Sent", count: 1245, percentage: 65, color: "bg-green-500" },
  { name: "Total Failed", count: 76, percentage: 4, color: "bg-red-500" },
]

export default function EmailPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEmails = emailFollowups.filter(
    (email) =>
      email.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent":
        return "bg-green-100 text-green-800"
      case "Scheduled":
        return "bg-amber-100 text-amber-800"
      case "Draft":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Sent":
        return <CheckCircle className="w-3.5 h-3.5" />
      case "Scheduled":
        return <Clock className="w-3.5 h-3.5" />
      case "Draft":
        return <AlertCircle className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  return (
    <Suspense fallback={<Loading />}>
      <>
        <PageHeader
          title="Email Follow-up"
          description="Manage and track email follow-ups with students."
        >
          <Button className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="w-4 h-4" />
            New Follow-up
          </Button>
        </PageHeader>

        {/* Email Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Sent</span>
                <div className="p-2 bg-muted rounded-lg">
                  <Send className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">1,245</p>
              <p className="text-xs text-[var(--color-positive)] mt-1">+15.2% vs last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Failed</span>
                <div className="p-2 bg-muted rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">76</p>
              <p className="text-xs text-[var(--color-negative)] mt-1">-2.1% vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Email Segments & List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Segments */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Email Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailStats.map((segment) => (
                  <div key={segment.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{segment.name}</span>
                      <span className="text-sm font-medium">{segment.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${segment.color}`}
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{segment.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email List */}
          <Card className="lg:col-span-3 bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Follow-ups</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search follow-ups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmails.map((email) => (
                      <tr key={email.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{email.student.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{email.student}</p>
                              <p className="text-xs text-muted-foreground">{email.course}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="text-sm font-medium">{email.subject}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">{email.preview}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
                            {email.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className={`flex items-center gap-1 w-fit ${getStatusColor(email.status)}`}>
                            {getStatusIcon(email.status)}
                            {email.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-muted-foreground">{email.sentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    </Suspense>
  )
}