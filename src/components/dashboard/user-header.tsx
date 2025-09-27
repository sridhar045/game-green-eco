import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { EcoButton } from "@/components/ui/eco-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Star, Award, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function UserHeader() {
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  if (!profile) return null

  return (
    <Card className="mb-8 eco-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {profile.full_name || 'Eco Warrior'}!
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Level {profile.level}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Leaf className="h-3 w-3 text-primary" />
                  {profile.points} Points
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EcoButton
              variant="outline"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Profile
            </EcoButton>
            <EcoButton
              variant="ghost"
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