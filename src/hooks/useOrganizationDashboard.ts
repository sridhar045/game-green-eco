import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

interface OrganizationStats {
  totalStudents: number
  activePrograms: number
  completedMissions: number
  impactScore: number
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
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrganizationStats() {
      if (!user || profile?.role !== 'organization' || !profile?.organization_name) return

      try {
        // Get total students in organization
        const { data: studentsData } = await supabase
          .from('profiles')
          .select('user_id, completed_missions, completed_lessons, eco_points')
          .eq('role', 'student')
          .eq('organization_name', profile.organization_name)
          .eq('region_district', profile.region_district)
          .eq('region_state', profile.region_state)

        // Get active missions
        const { data: missionsData } = await supabase
          .from('missions')
          .select('id')
          .eq('is_active', true)

        // Get recent mission submissions
        const { data: submissionsData } = await supabase
          .from('mission_submissions')
          .select(`
            *,
            mission:missions(title),
            student_profile:profiles!mission_submissions_user_id_fkey(display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        // Filter submissions from students in the same organization
        const orgSubmissions = submissionsData?.filter((submission: any) => {
          return studentsData?.some(student => student.user_id === submission.user_id)
        })

        const totalStudents = studentsData?.length || 0
        const totalMissions = studentsData?.reduce((sum, student) => sum + student.completed_missions, 0) || 0
        const totalEcoPoints = studentsData?.reduce((sum, student) => sum + student.eco_points, 0) || 0
        const impactScore = totalStudents > 0 ? Math.min(10, (totalEcoPoints / (totalStudents * 100)) * 10) : 0

        // Create recent activities from submissions
        const recentActivities = orgSubmissions?.slice(0, 5).map((submission: any, index) => ({
          id: submission.id,
          type: submission.status === 'approved' ? 'completion' : 'submission',
          message: submission.status === 'approved' 
            ? `${submission.student_profile?.display_name} completed ${submission.mission?.title}`
            : `${submission.student_profile?.display_name} submitted ${submission.mission?.title}`,
          timestamp: submission.status === 'approved' ? submission.reviewed_at : submission.submitted_at
        })) || []

        setStats({
          totalStudents,
          activePrograms: missionsData?.length || 0,
          completedMissions: totalMissions,
          impactScore: Math.round(impactScore * 10) / 10,
          recentActivities
        })
      } catch (error) {
        console.error('Error fetching organization stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationStats()
  }, [user, profile])

  return { stats, loading }
}