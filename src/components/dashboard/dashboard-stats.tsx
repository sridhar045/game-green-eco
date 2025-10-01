import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Target, Award, Leaf } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { DetailsModal } from "./details-modal"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export function DashboardStats() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'lessons' | 'missions' | 'badges'>('lessons')
  const [modalData, setModalData] = useState<any[]>([])

  const fetchLessonsDetails = async () => {
    if (!user) return []
    const { data } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lessons (title, description, duration_minutes)
      `)
      .eq('user_id', user.id)
      .eq('is_completed', true)
    return data || []
  }

  const fetchMissionsDetails = async () => {
    if (!user) return []
    const { data } = await supabase
      .from('mission_submissions')
      .select(`
        *,
        missions (title, description, difficulty, points)
      `)
      .eq('user_id', user.id)
      .in('status', ['approved', 'submitted'])
    return data || []
  }

  const [badgeCount, setBadgeCount] = useState(0)

  useEffect(() => {
    async function fetchBadgeCount() {
      if (!user) return
      const { count } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setBadgeCount(count || 0)
    }
    fetchBadgeCount()
  }, [user])

  const fetchBadgesDetails = async () => {
    if (!user) return []
    const { data } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (name, description, image_url)
      `)
      .eq('user_id', user.id)
    return data || []
  }

  const handleCardClick = async (type: 'lessons' | 'missions' | 'badges') => {
    setModalType(type)
    let data = []
    
    switch (type) {
      case 'lessons':
        data = await fetchLessonsDetails()
        break
      case 'missions':
        data = await fetchMissionsDetails()
        break
      case 'badges':
        data = await fetchBadgesDetails()
        break
    }
    
    setModalData(data)
    setModalOpen(true)
  }

  if (!profile) return null

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
        <p className="text-muted-foreground">
          Track your environmental learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('lessons')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lessons Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.completed_lessons || 0}</div>
            <p className="text-xs text-muted-foreground">
              Click to view details
            </p>
          </CardContent>
        </Card>

        <Card className="hover-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('missions')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Missions Completed
            </CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.completed_missions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Click to view details
            </p>
          </CardContent>
        </Card>

        <Card className="hover-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('badges')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges Earned
            </CardTitle>
            <Award className="h-4 w-4 text-eco-sun" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgeCount}</div>
            <p className="text-xs text-muted-foreground">
              Click to view details
            </p>
          </CardContent>
        </Card>

        <Card className="hover-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Eco Points
            </CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.eco_points || 0}</div>
            <p className="text-xs text-muted-foreground">
              Environmental impact!
            </p>
          </CardContent>
        </Card>
      </div>
      
      <DetailsModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        data={modalData}
      />
    </div>
  )
}