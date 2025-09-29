import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Award, Star, Trophy, Leaf, TreePine, ArrowLeft, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Profile() {
  const { profile } = useProfile()
  const navigate = useNavigate()

  const achievements = [
    { id: 1, name: "Climate Champion", description: "Completed 10 climate lessons", icon: Award, earned: true },
    { id: 2, name: "Mission Leader", description: "Led 3 community missions", icon: Star, earned: true },
    { id: 3, name: "Eco Warrior", description: "Earned 1000 points", icon: Trophy, earned: true },
    { id: 4, name: "Tree Hugger", description: "Planted 10 trees", icon: TreePine, earned: false },
    { id: 5, name: "Green Guardian", description: "Complete 20 missions", icon: Leaf, earned: false },
    { id: 6, name: "Sustainability Expert", description: "Master all lesson categories", icon: Award, earned: false }
  ]

  const stats = [
    { label: "Total Points", value: profile?.eco_points || 0, max: 2000 },
    { label: "Level Progress", value: ((profile?.level || 1) - 1) * 20 + 75, max: 100 },
    { label: "Lessons Completed", value: profile?.completed_lessons || 0, max: 20 },
    { label: "Missions Completed", value: profile?.completed_missions || 0, max: 15 }
  ]

  if (!profile) return null

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
                
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="flex items-center gap-1 text-lg px-3 py-1">
                    <Star className="h-4 w-4" />
                    Level {profile.level}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1">
                    <Leaf className="h-4 w-4 text-primary" />
                    {profile.eco_points} Points
                  </Badge>
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

        {/* Achievements */}
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
      </div>
    </div>
  )
}