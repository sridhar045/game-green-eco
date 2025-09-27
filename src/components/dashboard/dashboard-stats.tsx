import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Target, Trophy, TreePine } from "lucide-react"

export function DashboardStats() {
  const { profile } = useProfile()

  if (!profile) return null

  const stats = [
    {
      title: "Lessons Completed",
      value: "12",
      total: "20",
      icon: BookOpen,
      color: "text-primary",
      progress: 60
    },
    {
      title: "Missions Active",
      value: "3",
      total: "5",
      icon: Target,
      color: "text-accent",
      progress: 60
    },
    {
      title: "Badges Earned",
      value: "8",
      total: "15",
      icon: Trophy,
      color: "text-eco-sun",
      progress: 53
    },
    {
      title: "Trees Planted",
      value: "25",
      total: "50",
      icon: TreePine,
      color: "text-primary",
      progress: 50
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value}
              <span className="text-sm text-muted-foreground ml-1">
                / {stat.total}
              </span>
            </div>
            <Progress 
              value={stat.progress} 
              className="mt-2 h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stat.progress}% complete
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}