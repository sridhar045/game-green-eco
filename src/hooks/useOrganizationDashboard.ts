import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

interface OrganizationStats {
  totalStudents: number
  activePrograms: number
  completedMissions: number
  impactScore: number
  approvedMissions: number
  rejectedMissions: number
  recentActivities: Array<{
    id: string
    type: string
    message: string
    timestamp: string
  }>
}

export function useOrganizationDashboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [stats, setStats] = useState<OrganizationStats>({
    totalStudents: 0,
    activePrograms: 0,
    completedMissions: 0,
    impactScore: 0,
    approvedMissions: 0,
    rejectedMissions: 0,
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrganizationStats() {
      if (!user || profile?.role !== 'organization' || !profile?.organization_code) return

      try {
        // Get total students in organization using organization_code
        const { data: studentsData } = await supabase
          .from('profiles')
          .select('user_id, completed_missions, completed_lessons, eco_points')
          .eq('role', 'student')
          .eq('organization_code', profile.organization_code)

        // Get active missions
        const { data: missionsData } = await supabase
          .from('missions')
          .select('id')
          .eq('is_active', true)

        // Get recent mission submissions
        const { data: submissionsData } = await supabase
          .from('mission_submissions')
          .select('id, user_id, status')
          .order('created_at', { ascending: false })

        // Filter submissions from students in the same organization
        const orgSubmissions = submissionsData?.filter((submission: any) => {
          return studentsData?.some(student => student.user_id === submission.user_id)
        })

        const totalStudents = studentsData?.length || 0
        const totalMissions = studentsData?.reduce((sum, student) => sum + student.completed_missions, 0) || 0
        const totalEcoPoints = studentsData?.reduce((sum, student) => sum + student.eco_points, 0) || 0
        const impactScore = totalStudents > 0 ? Math.min(10, (totalEcoPoints / (totalStudents * 100)) * 10) : 0

        // Count approved and rejected missions
        const approvedCount = orgSubmissions?.filter((s: any) => s.status === 'approved').length || 0
        const rejectedCount = orgSubmissions?.filter((s: any) => s.status === 'rejected').length || 0

        // Get recent activities from activity_log
        const { data: activitiesData } = await supabase
          .from('activity_log')
          .select('*')
          .eq('organization_code', profile.organization_code)
          .order('created_at', { ascending: false })
          .limit(10)

        const recentActivities = activitiesData?.map((activity) => ({
          id: activity.id,
          type: activity.activity_type,
          message: activity.activity_message,
          timestamp: activity.created_at
        })) || []

      setStats({
        totalStudents,
        activePrograms: missionsData?.length || 0,
        completedMissions: totalMissions,
        impactScore: Math.round(impactScore * 10) / 10,
        approvedMissions: approvedCount,
        rejectedMissions: rejectedCount,
        recentActivities
      })
      } catch (error) {
        console.error('Error fetching organization stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationStats()

    // Set up real-time subscription for profile updates
    const channel = supabase
      .channel('organization-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `organization_code=eq.${profile?.organization_code}`
        },
        () => {
          fetchOrganizationStats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_submissions'
        },
        () => {
          fetchOrganizationStats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `organization_code=eq.${profile?.organization_code}`
        },
        () => {
          fetchOrganizationStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile])

  return { stats, loading }
}