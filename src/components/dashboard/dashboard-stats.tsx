import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Target, Trophy, TreePine } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export function DashboardStats() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    activeMissions: 0,
    totalBadges: 0,
    earnedBadges: 0
  })

  useEffect(() => {
    async function fetchStats() {
      if (!user) return

      try {
        // Fetch total lessons
        const { count: totalLessons } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)

        // Fetch user's lesson progress
        const { count: completedLessons } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_completed', true)

        // Fetch active missions for user
        const { count: activeMissions } = await supabase
          .from('mission_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['in_progress', 'submitted'])

        // Fetch total badges
        const { count: totalBadges } = await supabase
          .from('badges')
          .select('*', { count: 'exact', head: true })

        // Fetch user's earned badges
        const { count: earnedBadges } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setStats({
          totalLessons: totalLessons || 0,
          completedLessons: completedLessons || 0,
          activeMissions: activeMissions || 0,
          totalBadges: totalBadges || 0,
          earnedBadges: earnedBadges || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [user])

  if (!profile) return null

  const dashboardStats = [
    {
      title: "Lessons Completed",
      value: stats.completedLessons.toString(),
      total: stats.totalLessons.toString(),
      icon: BookOpen,
      color: "text-primary",
      progress: stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0
    },
    {
      title: "Missions Active",
      value: stats.activeMissions.toString(),
      total: "∞",
      icon: Target,
      color: "text-accent",
      progress: Math.min(stats.activeMissions * 20, 100)
    },
    {
      title: "Badges Earned",
      value: stats.earnedBadges.toString(),
      total: stats.totalBadges.toString(),
      icon: Trophy,
      color: "text-eco-sun",
      progress: stats.totalBadges > 0 ? Math.round((stats.earnedBadges / stats.totalBadges) * 100) : 0
    },
    {
      title: "Eco Points",
      value: profile.points?.toString() || "0",
      total: "∞",
      icon: TreePine,
      color: "text-primary",
      progress: Math.min((profile.points || 0) / 10, 100)
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {dashboardStats.map((stat, index) => (
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