import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function useLessonDetails(lessonId: string) {
  const { user } = useAuth()
  const [lesson, setLesson] = useState<any>(null)
  const [quizScore, setQuizScore] = useState<number | undefined>(undefined)
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetails() {
      if (!lessonId || !user) return

      try {
        // Fetch lesson
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single()

        // Fetch quiz score from lesson progress
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle()

        // Fetch linked missions
        const { data: missionsData } = await supabase
          .from('missions')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('is_active', true)

        // Check which missions are completed
        if (missionsData && missionsData.length > 0) {
          const missionIds = missionsData.map(m => m.id)
          const { data: submissionsData } = await supabase
            .from('mission_submissions')
            .select('mission_id, status')
            .eq('user_id', user.id)
            .in('mission_id', missionIds)
            .eq('status', 'approved')

          const completedMissionIds = new Set(
            submissionsData?.map(s => s.mission_id) || []
          )

          const missionsWithStatus = missionsData.map(mission => ({
            ...mission,
            isCompleted: completedMissionIds.has(mission.id)
          }))

          setMissions(missionsWithStatus)
        }

        setLesson(lessonData)
        // Mock quiz score - in real app, store this in lesson_progress
        setQuizScore(progressData?.progress_percentage === 100 ? 85 : undefined)
      } catch (error) {
        console.error('Error fetching lesson details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [lessonId, user])

  return { lesson, quizScore, missions, loading }
}