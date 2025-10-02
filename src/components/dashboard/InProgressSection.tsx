import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Target, Clock, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export function InProgressSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pausedLessons, setPausedLessons] = useState<any[]>([])
  const [inProgressMissions, setInProgressMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchInProgressItems()
    }
  }, [user])

  const fetchInProgressItems = async () => {
    if (!user) return

    try {
      // Fetch paused lessons (started but not completed)
      const { data: lessonsData } = await supabase
        .from('lesson_progress')
        .select('*, lessons(*)')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gt('progress_percentage', 0)
        .order('last_accessed_at', { ascending: false })
        .limit(3)

      // Fetch in-progress missions (started but not submitted)
      const { data: missionsData } = await supabase
        .from('mission_submissions')
        .select('*, missions(*)')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('updated_at', { ascending: false })
        .limit(3)

      setPausedLessons(lessonsData || [])
      setInProgressMissions(missionsData || [])
    } catch (error) {
      console.error('Error fetching in-progress items:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  if (pausedLessons.length === 0 && inProgressMissions.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Paused Lessons */}
      {pausedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pausedLessons.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/lesson/${item.lesson_id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.lessons?.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(item.progress_percentage)}%
                  </Badge>
                </div>
                <Progress value={item.progress_percentage} className="h-1.5 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last accessed {new Date(item.last_accessed_at).toLocaleDateString()}
                  </span>
                  <EcoButton variant="ghost" size="sm" className="h-7 px-2">
                    <ArrowRight className="h-3 w-3" />
                  </EcoButton>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* In-Progress Missions */}
      {inProgressMissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Continue Missions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressMissions.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/mission/${item.mission_id}/submit`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.missions?.title}</h4>
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-700">
                    In Progress
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.missions?.estimated_time}
                  </span>
                  <span>{item.missions?.points} points</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Started {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <EcoButton variant="ghost" size="sm" className="h-7 px-2">
                    <ArrowRight className="h-3 w-3" />
                  </EcoButton>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}