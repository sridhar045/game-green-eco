import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

interface LeaderboardEntry {
  organization_name: string
  region_district: string
  region_state: string
  region_country: string
  total_eco_points: number
  student_count: number
  total_lessons_completed: number
  total_missions_completed: number
  avg_eco_points: number
}

interface UserRank extends LeaderboardEntry {
  rank: number
}

export function useLeaderboardData() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<UserRank | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        // Fetch leaderboard data ordered by total eco points
        const { data: leaderboard, error } = await supabase
          .from('organization_leaderboard')
          .select('*')
          .order('total_eco_points', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Error fetching leaderboard:', error)
          return
        }

        setLeaderboardData(leaderboard || [])

        // Find user's organization rank if profile exists
        if (profile?.organization_name && leaderboard) {
          const userOrgIndex = leaderboard.findIndex(
            org => org.organization_name === profile.organization_name &&
                  org.region_district === profile.region_district &&
                  org.region_state === profile.region_state
          )

          if (userOrgIndex !== -1) {
            setUserRank({
              ...leaderboard[userOrgIndex],
              rank: userOrgIndex + 1
            })
          }
        }
      } catch (error) {
        console.error('Error with leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [profile])

  return { leaderboardData, userRank, loading }
}