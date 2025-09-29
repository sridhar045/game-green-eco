import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { Building2, Users, BookOpen, Target, FileText } from "lucide-react"
import { useOrganizationDashboard } from "@/hooks/useOrganizationDashboard"
import { MissionReviewModal } from "@/components/mission/mission-review-modal"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

export function OrganizationDashboard() {
  const { stats, loading } = useOrganizationDashboard()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-8">Loading dashboard...</div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Organization Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your environmental education programs
          </p>
          <div className="mt-4">
            <EcoButton 
              onClick={() => setReviewModalOpen(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Review Submissions
            </EcoButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Active in your organization
              </p>
            </CardContent>
          </Card>

          <Card className="hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Programs
              </CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrograms}</div>
              <p className="text-xs text-muted-foreground">
                Available missions
              </p>
            </CardContent>
          </Card>

          <Card className="hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Missions
              </CardTitle>
              <Target className="h-4 w-4 text-eco-sun" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedMissions}</div>
              <p className="text-xs text-muted-foreground">
                Total by your students
              </p>
            </CardContent>
          </Card>

          <Card className="hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Impact Score
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.impactScore}</div>
              <p className="text-xs text-muted-foreground">
                Out of 10.0
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="eco-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your environmental education programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{activity.type === 'completion' ? 'Mission completed' : 'New submission'}</p>
                      <p className="text-sm text-muted-foreground">{activity.message}</p>
                    </div>
                    <Badge variant="secondary">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <MissionReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  )
}