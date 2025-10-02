import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EcoButton } from '@/components/ui/eco-button'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { Tables } from '@/integrations/supabase/types'

type Mission = Tables<'missions'>
type MissionSubmission = Tables<'mission_submissions'>

interface MissionWithSubmission extends Mission {
  submission?: MissionSubmission
}

interface LessonMissionsProps {
  lessonId: string
  onMissionStart: () => void
}

export function LessonMissions({ lessonId, onMissionStart }: LessonMissionsProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState<MissionWithSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (lessonId && user) {
      fetchMissions()
    }
  }, [lessonId, user])

  const fetchMissions = async () => {
    try {
      // Fetch missions linked to this lesson
      const { data: missionsData, error } = await supabase
        .from('missions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_active', true)
        .order('created_at')

      if (error) {
        console.error('Error fetching missions:', error)
        return
      }

      if (user && missionsData.length > 0) {
        // Fetch user submissions for these missions
        const missionIds = missionsData.map(m => m.id)
        const { data: submissionsData } = await supabase
          .from('mission_submissions')
          .select('*')
          .eq('user_id', user.id)
          .in('mission_id', missionIds)

        const missionsWithSubmissions = missionsData.map(mission => {
          const submission = submissionsData?.find(s => s.mission_id === mission.id)
          return { ...mission, submission }
        })

        setMissions(missionsWithSubmissions)
      } else {
        setMissions(missionsData || [])
      }
    } catch (error) {
      console.error('Error fetching missions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartMission = async (missionId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('mission_submissions')
        .upsert({
          user_id: user.id,
          mission_id: missionId,
          status: 'in_progress'
        }, {
          onConflict: 'user_id,mission_id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error starting mission:', error)
        return
      }

      onMissionStart()
      navigate(`/mission/${missionId}/submit`)
    } catch (error) {
      console.error('Error starting mission:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-500/10 text-red-700 border-red-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getStatusBadge = (submission?: MissionSubmission) => {
    if (!submission) return null
    
    switch (submission.status) {
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">In Progress</Badge>
      case 'submitted':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">Under Review</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500/10 text-green-700">Completed</Badge>
      case 'rejected':
        return <Badge variant="destructive">Needs Revision</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div>Loading missions...</div>
        </CardContent>
      </Card>
    )
  }

  if (missions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Related Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No missions available for this lesson yet.</p>
            <p className="text-sm mb-6">Check back later for new challenges!</p>
            <EcoButton 
              variant="eco"
              onClick={() => navigate('/dashboard')}
              className="mx-auto"
            >
              Back to Dashboard
            </EcoButton>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Related Missions ({missions.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Apply what you've learned by completing these real-world missions
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{mission.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mission.description}
                    </p>
                  </div>
                  {getStatusBadge(mission.submission)}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mission.estimated_time}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDifficultyColor(mission.difficulty)}`}
                  >
                    {mission.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {mission.points} points
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-primary">
                    Category: {mission.category}
                  </div>
                  
                  {mission.submission?.status === 'approved' ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  ) : (
                    <EcoButton
                      variant={mission.submission ? "outline" : "eco"}
                      size="sm"
                      onClick={() => handleStartMission(mission.id)}
                      className="flex items-center gap-2"
                    >
                      {mission.submission?.status === 'in_progress' ? (
                        <>Continue</>
                      ) : mission.submission?.status === 'submitted' ? (
                        <>View Submission</>
                      ) : mission.submission?.status === 'rejected' ? (
                        <>Revise Submission</>
                      ) : (
                        <>Start Mission</>
                      )}
                      <ArrowRight className="h-3 w-3" />
                    </EcoButton>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}