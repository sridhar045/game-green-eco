import { UserHeader } from "@/components/dashboard/user-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { NavigationCards } from "@/components/dashboard/navigation-cards"
import { OrganizationDashboard } from "@/components/dashboard/OrganizationDashboard"
import { useProfile } from "@/hooks/useProfile"

export default function Dashboard() {
  const { profile } = useProfile()

  // Show organization dashboard for organization users
  if (profile?.role === 'organization') {
    return <OrganizationDashboard />
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