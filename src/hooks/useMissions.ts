import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Tables } from '@/integrations/supabase/types'
import { toast } from "sonner"

type Mission = Tables<'missions'>
type MissionSubmission = Tables<'mission_submissions'>

interface MissionWithSubmission extends Mission {
  submission?: MissionSubmission
}

export function useMissions() {
  const { user } = useAuth()
  const [missions, setMissions] = useState<MissionWithSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMissions() {
      try {
        const { data: missionsData, error } = await supabase
          .from('missions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching missions:', error)
          return
        }

        if (user) {
          // Fetch user submissions for these missions
          const { data: submissionsData } = await supabase
            .from('mission_submissions')
            .select('*')
            .eq('user_id', user.id)

          const missionsWithSubmissions = missionsData.map(mission => {
            const submission = submissionsData?.find(s => s.mission_id === mission.id)
            return { ...mission, submission }
          })

          setMissions(missionsWithSubmissions)
        } else {
          setMissions(missionsData)
        }
      } catch (error) {
        console.error('Error fetching missions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMissions()

    // Set up real-time subscription for mission submissions
    if (user) {
      const channel = supabase
        .channel('mission-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mission_submissions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchMissions()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const startMission = async (missionId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('mission_submissions')
        .insert({
          user_id: user.id,
          mission_id: missionId,
          status: 'in_progress'
        })

      if (error) {
        console.error('Error starting mission:', error)
      } else {
        // Refresh missions to show updated status
        setMissions(prev => prev.map(mission => 
          mission.id === missionId 
            ? { ...mission, submission: { 
                user_id: user.id, 
                mission_id: missionId, 
                status: 'in_progress' 
              } as MissionSubmission }
            : mission
        ))
      }
    } catch (error) {
      console.error('Error starting mission:', error)
    }
  }

  const submitMission = async (missionId: string, submissionData: any) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('mission_submissions')
        .upsert({
          user_id: user.id,
          mission_id: missionId,
          status: 'submitted',
          submission_data: submissionData,
          submitted_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error submitting mission:', error)
      } else {
        toast.success("Mission submitted successfully! It's under review.")
      }
    } catch (error) {
      console.error('Error submitting mission:', error)
    }
  }

  return { missions, loading, startMission, submitMission }
}
