import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import type { Tables } from '@/integrations/supabase/types'

type MissionSubmission = Tables<'mission_submissions'>
type Mission = Tables<'missions'>

interface MissionSubmissionWithDetails extends MissionSubmission {
  mission: Mission | null
  student_profile: {
    display_name: string
    user_id: string
  }
}

export function useMissionReview() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [submissions, setSubmissions] = useState<MissionSubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPendingSubmissions() {
      if (!user || profile?.role !== 'organization') return

      try {
        // Get submissions from students in the same organization
        const { data: submissionsData, error } = await supabase
          .from('mission_submissions')
          .select(`
            *,
            missions(*)
          `)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false })

        if (error) {
          console.error('Error fetching submissions:', error)
          return
        }

        if (submissionsData) {
          // Get student profiles for each submission
          const userIds = submissionsData.map(sub => sub.user_id)
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, display_name, organization_name, region_district, region_state')
            .in('user_id', userIds)

          // Filter submissions from students in the same organization and add profile data
          const filteredSubmissions = submissionsData
            .map((submission: any) => {
              const studentProfile = profilesData?.find(p => p.user_id === submission.user_id)
              return {
                ...submission,
                mission: submission.missions,
                student_profile: {
                  display_name: studentProfile?.display_name || 'Unknown',
                  user_id: studentProfile?.user_id || submission.user_id
                }
              }
            })
            .filter((submission: any) => {
              const studentProfile = profilesData?.find(p => p.user_id === submission.user_id)
              return studentProfile?.organization_name === profile.organization_name &&
                     studentProfile?.region_district === profile.region_district &&
                     studentProfile?.region_state === profile.region_state
            })

          setSubmissions(filteredSubmissions)
        }
      } catch (error) {
        console.error('Error with mission review:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingSubmissions()
  }, [user, profile])

  const approveSubmission = async (submissionId: string, pointsAwarded: number) => {
    try {
      const { error } = await supabase
        .from('mission_submissions')
        .update({
          status: 'approved',
          points_awarded: pointsAwarded,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: 'Approved by organization'
        })
        .eq('id', submissionId)

      if (error) {
        console.error('Error approving submission:', error)
        return false
      }

      // Remove from local state
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      return true
    } catch (error) {
      console.error('Error approving submission:', error)
      return false
    }
  }

  const rejectSubmission = async (submissionId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('mission_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reason
        })
        .eq('id', submissionId)

      if (error) {
        console.error('Error rejecting submission:', error)
        return false
      }

      // Remove from local state
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      return true
    } catch (error) {
      console.error('Error rejecting submission:', error)
      return false
    }
  }

  return { submissions, loading, approveSubmission, rejectSubmission }
}