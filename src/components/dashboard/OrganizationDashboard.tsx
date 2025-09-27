import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, BookOpen, Target } from "lucide-react"

export function OrganizationDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Organization Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your environmental education programs
          </p>
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
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
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
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                3 new this month
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
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">
                +28% completion rate
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
              <div className="text-2xl font-bold">8.7</div>
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
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">New student enrollment</p>
                  <p className="text-sm text-muted-foreground">25 students joined the Climate Action program</p>
                </div>
                <Badge variant="secondary">2 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Mission completed</p>
                  <p className="text-sm text-muted-foreground">Urban Garden project reached 100% completion</p>
                </div>
                <Badge variant="secondary">1 day ago</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">New achievement unlocked</p>
                  <p className="text-sm text-muted-foreground">Students earned "Water Conservation Champion" badge</p>
                </div>
                <Badge variant="secondary">3 days ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}