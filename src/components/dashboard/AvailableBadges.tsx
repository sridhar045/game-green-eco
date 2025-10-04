import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"

interface BadgeItem {
  id: string
  name: string
  description: string
  image_url: string
  requirements: Record<string, unknown> | null
}

export function AvailableBadges() {
  const [badges, setBadges] = useState<BadgeItem[]>([])

  useEffect(() => {
    async function fetchBadges() {
      const { data } = await supabase
        .from('badges')
        .select('id, name, description, image_url, requirements')
        .order('name', { ascending: true })
      setBadges((data as any) || [])
    }
    fetchBadges()
  }, [])

  const renderRequirement = (req: Record<string, unknown> | null) => {
    if (!req) return null
    // Try to create a human-friendly requirement string
    if (req.lesson_id) return <span>Complete the linked lesson</span>
    if (req.mission_category) return <span>Complete missions in category: <b className="capitalize">{String(req.mission_category)}</b></span>
    return <span>See details in lesson/mission</span>
  }

  if (!badges.length) return null

  return (
    <section aria-labelledby="available-badges-title" className="mt-10">
      <div className="text-center mb-6">
        <h2 id="available-badges-title" className="text-2xl font-bold mb-2">Available Badges to Earn</h2>
        <p className="text-muted-foreground">Discover all badges and how to earn them</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((b) => (
          <Card key={b.id} className="hover-shadow">
            <CardHeader className="flex items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image_url} alt={`${b.name} badge`} className="w-full h-full object-cover" />
              </div>
              <CardTitle className="text-lg">{b.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{b.description}</p>
              <div className="text-xs">
                <Badge variant="outline">How to earn</Badge>
                <div className="mt-1 text-muted-foreground">
                  {renderRequirement(b.requirements as any)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
