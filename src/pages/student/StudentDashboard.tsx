import { UserHeader } from "@/components/dashboard/user-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { NavigationCards } from "@/components/dashboard/navigation-cards"
import { InProgressSection } from "@/components/dashboard/InProgressSection"
import { useProfile } from "@/hooks/useProfile"
import { useEffect, useRef, useState } from "react"
import { EcoCelebrations } from "@/components/ui/eco-celebrations"

export default function StudentDashboard() {
  const { profile } = useProfile()
  const prevPoints = useRef<number | null>(null)
  const prevLevel = useRef<number | null>(null)
  const [pointsGain, setPointsGain] = useState<number | null>(null)
  const [levelChange, setLevelChange] = useState<{ from: number; to: number } | null>(null)

  useEffect(() => {
    if (!profile) return
    if (prevPoints.current !== null && profile.eco_points > prevPoints.current) {
      setPointsGain(profile.eco_points - prevPoints.current)
    }
    if (prevLevel.current !== null && profile.level > prevLevel.current) {
      setLevelChange({ from: prevLevel.current, to: profile.level })
    }
    prevPoints.current = profile.eco_points
    prevLevel.current = profile.level
  }, [profile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <EcoCelebrations
        points={pointsGain ?? undefined}
        levelFrom={levelChange?.from}
        levelTo={levelChange?.to}
        onDone={() => {
          setPointsGain(null)
          setLevelChange(null)
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <UserHeader />
        <DashboardStats />
        <InProgressSection />
        <NavigationCards />
      </div>
    </div>
  )
}
