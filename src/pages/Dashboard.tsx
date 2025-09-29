import { UserHeader } from "@/components/dashboard/user-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { NavigationCards } from "@/components/dashboard/navigation-cards"
import { OrganizationDashboard } from "@/components/dashboard/OrganizationDashboard"
import { OrganizationCodeWelcome } from "@/components/dashboard/OrganizationCodeWelcome"
import { useProfile } from "@/hooks/useProfile"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { profile } = useProfile()
  const [showOrgCodeWelcome, setShowOrgCodeWelcome] = useState(false)

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

  // Show organization dashboard for organization users
  if (profile?.role === 'organization') {
    return (
      <>
        <OrganizationDashboard />
        {showOrgCodeWelcome && (
          <OrganizationCodeWelcome onClose={handleCloseOrgWelcome} />
        )}
      </>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* User Header */}
        <UserHeader />

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Navigation Cards */}
        <NavigationCards />
      </div>
    </div>
  )
}