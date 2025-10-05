import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { Star, Leaf, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function UserHeader() {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
      navigate("/login")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const getUserLevel = (ecoPoints: number) => {
    return Math.floor(ecoPoints / 200)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  if (!profile) return null

  return (
    <Card className="mb-6 eco-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {profile.display_name ? getInitials(profile.display_name) : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{profile.display_name || user?.email}</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {profile.role}
                </Badge>
                <Badge variant="secondary" className="capitalize flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">Level {getUserLevel(profile.eco_points)}</span>
                </Badge>
                 <Badge variant="secondary" className="capitalize">
                  {profile.streak_days > 1 ? `🔥 ${profile.streak_days} days streak` : `🔥 ${profile.streak_days} day streak`}
                </Badge>
                <Badge variant="secondary" className="capitalize flex items-center gap-1">
                  <Leaf className="h-4 w-4" />
                  <span className="font-medium">{profile.eco_points} Eco Points</span>
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <EcoButton
              variant="outline"
              onClick={() => navigate("/student/profile")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </EcoButton>
            <EcoButton
              variant="destructive"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </EcoButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}