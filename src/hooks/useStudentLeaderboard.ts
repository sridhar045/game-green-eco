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

        // Fetch leaderboard via secured RPC to respect RLS while scoping by your region
        const { data: students, error } = await supabase
          .rpc('get_student_leaderboard') as any

        if (error) {
          console.error('Error fetching student leaderboard:', error)
          return
        }

        setLeaderboardData(students || [])

        // Find user's rank if profile exists
        if (profile && students) {
          const userIndex = students.findIndex(
            (student: StudentLeaderboardEntry) => student.user_id === user?.id
          )

          if (userIndex !== -1) {
            setUserRank({
              ...(students[userIndex] as StudentLeaderboardEntry),
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