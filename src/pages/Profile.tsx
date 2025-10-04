import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Star, Trophy, Leaf, TreePine, ArrowLeft, Settings, Building2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function Profile() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [orgStats, setOrgStats] = useState({ approved: 0, rejected: 0, totalStudents: 0, totalMissions: 0 })
  const [organizationName, setOrganizationName] = useState('')
  const [totalMissionsOrganizationCanApproveOrReject, setTotalMissionsOrganizationCanApproveOrReject] = useState(orgStats.totalStudents * orgStats.totalMissions)




  useEffect(() => {
    async function fetchOrgStats() {
      if (!profile) return

      if (profile.role === 'student') {
        // Use denormalized organization_name from own profile (kept in sync via trigger)
        setOrganizationName(profile.organization_name || '')
        return
      }

      if (!profile.organization_code) return

      try {
        // First, get all student user IDs for this organization
        const { data: students } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('organization_code', profile.organization_code)
          .eq('role', 'student')

        const studentIds = students?.map(s => s.user_id) || []
        if (studentIds.length === 0) {
          setOrgStats({ approved: 0, rejected: 0, totalStudents: 0, totalMissions: 0 })
          return
        }

        // Fetch total missions
        const { count: totalMissionsCount } = await supabase
          .from('missions')
          .select('*', { count: 'exact', head: true })

        // Fetch approved missions
        const { count: approvedCount } = await supabase
          .from('mission_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .in('user_id', studentIds)

        // Fetch rejected missions
        const { count: rejectedCount } = await supabase
          .from('mission_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected')
          .in('user_id', studentIds)


        setOrgStats({
          approved: approvedCount || 0,
          rejected: rejectedCount || 0,
          totalStudents: studentIds.length,
          totalMissions: totalMissionsCount || 0,
        })
      } catch (error) {
        console.error('Error fetching org stats:', error)
      }
    }

    fetchOrgStats()
    setTotalMissionsOrganizationCanApproveOrReject(orgStats.totalStudents * orgStats.totalMissions)

  }, [orgStats.totalMissions, orgStats.totalStudents, profile])

  if (!profile) return null

  const isOrganization = profile.role === 'organization'
  const pointsPerLevel = isOrganization ? 2000 : 200

  // Calculate real level progress
  const currentLevel = profile.level - 1 || 0
  const currentPoints = profile.eco_points || 0
  const pointsForCurrentLevel = currentLevel * pointsPerLevel
  const pointsForNextLevel = (currentLevel + 1) * pointsPerLevel
  const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel
  const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel
  const levelProgress = Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100))
  console.log(currentLevel,'level');
  

  const [earnedBadges, setEarnedBadges] = useState<Array<{ id: string; earned_at: string; badge: { name: string; description: string; image_url: string } }>>([])

  useEffect(() => {
    async function fetchEarnedBadges() {
      if (!profile) return
      const { data } = await supabase
        .from('user_badges')
        .select(`id, earned_at, badges:badge_id ( name, description, image_url )`)
        .eq('user_id', profile.user_id)
        .order('earned_at', { ascending: false })
      const mapped = (data || []).map((ub: any) => ({ id: ub.id, earned_at: ub.earned_at, badge: ub.badges }))
      setEarnedBadges(mapped)
    }
    fetchEarnedBadges()
  }, [profile])

  const studentStats = [
    { label: "Total Points", value: profile?.eco_points || 0, info: '', max: pointsForNextLevel },
    { label: "Level Progress", value: levelProgress, info: `${pointsInCurrentLevel}/200`, max: 100 },
    { label: "Lessons Completed", value: profile?.completed_lessons || 0, info: '', max: 20 },
    { label: "Missions Completed", value: profile?.completed_missions || 0, info: '', max: 15 }
  ]

  const organizationStats = [
    { label: "Total Eco Points", value: profile?.eco_points || 0, info: '',max: pointsPerLevel },
    { label: "Level Progress", value: levelProgress, info: '',max: 100 },
    { label: "Missions Approved", value: orgStats.approved, info: '',max: Math.min(orgStats.approved + 10, totalMissionsOrganizationCanApproveOrReject) },
    { label: "Missions Rejected", value: orgStats.rejected, info: '',max: Math.max(orgStats.rejected + 10, totalMissionsOrganizationCanApproveOrReject) },
    { label: "Total Students", value: orgStats.totalStudents, info: '', max: Math.max(orgStats.totalStudents + 10, 100) }
  ]

  const stats = isOrganization ? organizationStats : studentStats

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <EcoButton
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </EcoButton>
          <EcoButton variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit Profile
          </EcoButton>
        </div>

        {/* Profile Header */}
        <Card className="mb-8 eco-shadow">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {profile.display_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {profile.display_name || 'Eco Warrior'}
                </h1>
                <p className="text-muted-foreground mb-4">{profile.email}</p>

                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1 text-lg px-3 py-1">
                    <Star className="h-4 w-4" />
                    Level {currentLevel}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1">
                    <Leaf className="h-4 w-4 text-primary" />
                    {profile.eco_points} Points
                  </Badge>
                  {profile.role === 'student' && organizationName && (
                    <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1 bg-accent/10 border-accent/20 text-accent">
                      <Building2 className="h-4 w-4" />
                      {organizationName}
                    </Badge>
                  )}
                  {profile.role === 'organization' && profile.organization_code && (
                    <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1 bg-primary/5 border-primary/20 text-primary">
                      <Settings className="h-4 w-4" />
                      Code: {profile.organization_code}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold flex items-center">{stat.value} {stat.info && (<p className="text-gray-400 text-sm ms-2">{`(${stat.info})`}</p>)}</span>
                  <span className="text-sm text-muted-foreground">/ {stat.max}</span>
                </div>
                <Progress value={(stat.value / stat.max) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((stat.value / stat.max) * 100)}% complete
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements - Only for students */}
        {!isOrganization && (
          <Card className="eco-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-eco-sun" />
                Achievements
              </CardTitle>
              <CardDescription>
                Your environmental impact milestones and badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${achievement.earned
                      ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                      : 'bg-muted/20 border-muted opacity-60'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${achievement.earned ? 'bg-primary/10' : 'bg-muted/30'
                        }`}>
                        <achievement.icon className={`h-5 w-5 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                          {achievement.name}
                        </h3>
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}