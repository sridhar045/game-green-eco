import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

interface StudentLeaderboardEntry {
  user_id: string
  display_name: string
  eco_points: number
  completed_missions: number
  completed_lessons: number
  level: number
  organization_name: string
  region_district: string
  region_state: string
}

interface StudentRank extends StudentLeaderboardEntry {
  rank: number
}

export function useStudentLeaderboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [leaderboardData, setLeaderboardData] = useState<StudentLeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<StudentRank | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudentLeaderboard() {
      try {
        if (!profile) {
          setLoading(false)
          return
        }

        // Build query based on user's role and region
        let query = supabase
          .from('profiles')
          .select('user_id, display_name, eco_points, completed_missions, completed_lessons, level, organization_name, region_district, region_state')
          .eq('role', 'student')
          .not('display_name', 'is', null)

        // Filter based on profile settings
        if (profile.role === 'organization' && profile.organization_code) {
          // Organization: filter by organization_code
          query = query.eq('organization_code', profile.organization_code)
        } else if (profile.region_district) {
          // District level: filter by district
          query = query.eq('region_district', profile.region_district)
        } else if (profile.region_state) {
          // State level: filter by state
          query = query.eq('region_state', profile.region_state)
        } else if (profile.region_country) {
          // Country level: filter by country
          query = query.eq('region_country', profile.region_country)
        }

        const { data: students, error } = await query
          .order('eco_points', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Error fetching student leaderboard:', error)
          return
        }

        setLeaderboardData(students || [])

        // Find user's rank if profile exists
        if (profile && students) {
          const userIndex = students.findIndex(
            student => student.user_id === user?.id
          )

          if (userIndex !== -1) {
            setUserRank({
              ...students[userIndex],
              rank: userIndex + 1
            })
          }
        }
      } catch (error) {
        console.error('Error with student leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentLeaderboard()
  }, [profile, user])

  return { leaderboardData, userRank, loading }
}