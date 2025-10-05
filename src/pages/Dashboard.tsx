import { UserHeader } from "@/components/dashboard/user-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { NavigationCards } from "@/components/dashboard/navigation-cards"
import { OrganizationDashboard } from "@/components/dashboard/OrganizationDashboard"
import { OrganizationCodeWelcome } from "@/components/dashboard/OrganizationCodeWelcome"
import { InProgressSection } from "@/components/dashboard/InProgressSection"
import { useProfile } from "@/hooks/useProfile"
import { useState, useEffect, useRef } from "react"
import { EcoCelebrations } from "@/components/ui/eco-celebrations"

export default function Dashboard() {
  const { profile } = useProfile()
  const [showOrgCodeWelcome, setShowOrgCodeWelcome] = useState(false)
  const prevPoints = useRef<number | null>(null)
  const prevLevel = useRef<number | null>(null)
  const [pointsGain, setPointsGain] = useState<number | null>(null)
  const [levelChange, setLevelChange] = useState<{ from: number; to: number } | null>(null)
  // Show organization code welcome for new organizations
  useEffect(() => {
    if (profile?.role === 'organization' && profile.organization_code) {
      // Check if this is a new signup by checking if they've seen the welcome
      const hasSeenWelcome = localStorage.getItem(`org_welcome_${profile.id}`)
      if (!hasSeenWelcome) {
        setShowOrgCodeWelcome(true)
      }
    }
  }, [profile])

  const handleCloseOrgWelcome = () => {
    if (profile?.id) {
      localStorage.setItem(`org_welcome_${profile.id}`, 'true')
    }
    setShowOrgCodeWelcome(false)
  }

  const isOrg = profile?.role === 'organization'

  // Detect point/level gains for animations
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
        onDone={() => { setPointsGain(null); setLevelChange(null); }}
      />
      {isOrg ? (
        <>
          <OrganizationDashboard />
          {showOrgCodeWelcome && (
            <OrganizationCodeWelcome onClose={handleCloseOrgWelcome} />
          )}
        </>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <UserHeader />
          <DashboardStats />
          <InProgressSection />
          <NavigationCards />
        </div>
      )}
    </div>
  )
}