import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, Award } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface BadgeItem {
  id: string
  name: string
  description: string
  image_url: string
  requirements: Record<string, unknown> | null
}

export default function AvailableBadgesPage() {
  const navigate = useNavigate()
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBadges() {
      const { data } = await supabase
        .from('badges')
        .select('id, name, description, image_url, requirements')
        .order('name', { ascending: true })
      setBadges((data as any) || [])
      setLoading(false)
    }
    fetchBadges()
  }, [])

  const renderRequirement = (req: Record<string, unknown> | null) => {
    if (!req) return <span className="text-muted-foreground">Complete related activities</span>
    // Try to create a human-friendly requirement string
    if (req.lesson_id) return <span>Complete the linked lesson</span>
    if (req.mission_category) return <span>Complete missions in category: <b className="capitalize">{String(req.mission_category)}</b></span>
    return <span>See details in lesson/mission</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Available Badges</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover all badges you can earn by completing lessons and missions
          </p>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading badges...</p>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No badges available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((b) => (
              <Card key={b.id} className="hover-shadow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 overflow-hidden">
                    {b.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image_url} alt={`${b.name} badge`} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{b.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center min-h-[3rem]">
                    {b.description}
                  </p>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-center mb-2">
                      <Badge variant="outline" className="text-xs">How to earn</Badge>
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      {renderRequirement(b.requirements as any)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
