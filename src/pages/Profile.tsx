import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Award, Star, Trophy, Leaf, TreePine, ArrowLeft, Settings, Building2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function Profile() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [orgStats, setOrgStats] = useState({ approved: 0, rejected: 0, totalStudents: 0 })

  useEffect(() => {
    async function fetchOrgStats() {
      if (!profile || profile.role !== 'organization' || !profile.organization_code) return

      try {
        // First, get all student user IDs for this organization
        const { data: students } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('organization_code', profile.organization_code)
          .eq('role', 'student')

        const studentIds = students?.map(s => s.user_id) || []

        if (studentIds.length === 0) {
          setOrgStats({ approved: 0, rejected: 0, totalStudents: 0 })
          return
        }

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
          totalStudents: studentIds.length
        })
      } catch (error) {
        console.error('Error fetching org stats:', error)
      }
    }

    fetchOrgStats()
  }, [profile])

  if (!profile) return null

  const isOrganization = profile.role === 'organization'
  const pointsPerLevel = isOrganization ? 2000 : 200
  
  // Calculate real level progress
  const currentLevel = profile.level || 1
  const currentPoints = profile.eco_points || 0
  const pointsForCurrentLevel = (currentLevel - 1) * pointsPerLevel
  const pointsForNextLevel = currentLevel * pointsPerLevel
  const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel
  const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel
  const levelProgress = Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100))

  const achievements = [
    { id: 1, name: "Climate Champion", description: "Completed 10 climate lessons", icon: Award, earned: (profile.completed_lessons || 0) >= 10 },
    { id: 2, name: "Mission Leader", description: "Led 3 community missions", icon: Star, earned: (profile.completed_missions || 0) >= 3 },
    { id: 3, name: "Eco Warrior", description: "Earned 1000 points", icon: Trophy, earned: (profile.eco_points || 0) >= 1000 },
    { id: 4, name: "Tree Hugger", description: "Planted 10 trees", icon: TreePine, earned: false },
    { id: 5, name: "Green Guardian", description: "Complete 20 missions", icon: Leaf, earned: (profile.completed_missions || 0) >= 20 },
    { id: 6, name: "Sustainability Expert", description: "Master all lesson categories", icon: Award, earned: false }
  ]

  const studentStats = [
    { label: "Total Points", value: profile?.eco_points || 0, max: pointsPerLevel },
    { label: "Level Progress", value: levelProgress, max: 100 },
    { label: "Lessons Completed", value: profile?.completed_lessons || 0, max: 20 },
    { label: "Missions Completed", value: profile?.completed_missions || 0, max: 15 }
  ]

  const organizationStats = [
    { label: "Total Eco Points", value: profile?.eco_points || 0, max: pointsPerLevel * 2 },
    { label: "Level Progress", value: levelProgress, max: 100 },
    { label: "Missions Approved", value: orgStats.approved, max: Math.max(orgStats.approved + 10, 50) },
    { label: "Missions Rejected", value: orgStats.rejected, max: Math.max(orgStats.rejected + 10, 50) },
    { label: "Total Students", value: orgStats.totalStudents, max: Math.max(orgStats.totalStudents + 10, 100) }
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
                    Level {profile.level}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1">
                    <Leaf className="h-4 w-4 text-primary" />
                    {profile.eco_points} Points
                  </Badge>
                   {profile.role === 'student' && profile.organization_name && (
                    <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1 bg-accent/10 border-accent/20 text-accent">
                      <Building2 className="h-4 w-4" />
                      {profile.organization_name}
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
                  <span className="text-2xl font-bold">{stat.value}</span>
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
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      achievement.earned 
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                        : 'bg-muted/20 border-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${
                        achievement.earned ? 'bg-primary/10' : 'bg-muted/30'
                      }`}>
                        <achievement.icon className={`h-5 w-5 ${
                          achievement.earned ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.earned ? 'text-foreground' : 'text-muted-foreground'
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