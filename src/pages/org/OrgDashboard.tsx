import { OrganizationDashboard } from "@/components/dashboard/OrganizationDashboard"
import { OrganizationCodeWelcome } from "@/components/dashboard/OrganizationCodeWelcome"
import { useProfile } from "@/hooks/useProfile"
import { useEffect, useState } from "react"

export default function OrgDashboard() {
  const { profile } = useProfile()
  const [showOrgCodeWelcome, setShowOrgCodeWelcome] = useState(false)

  useEffect(() => {
    if (profile?.role === 'organization' && profile.organization_code) {
      const hasSeenWelcome = localStorage.getItem(`org_welcome_${profile.id}`)
      if (!hasSeenWelcome) setShowOrgCodeWelcome(true)
    }
  }, [profile])

  const handleClose = () => {
    if (profile?.id) localStorage.setItem(`org_welcome_${profile.id}`, 'true')
    setShowOrgCodeWelcome(false)
  }

  return (
    <>
      <OrganizationDashboard />
      {showOrgCodeWelcome && (
        <OrganizationCodeWelcome onClose={handleClose} />
      )}
    </>
  )
}
