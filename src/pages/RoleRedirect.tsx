import { useProfile } from "@/hooks/useProfile"
import { Navigate } from "react-router-dom"

export default function RoleRedirect() {
  const { profile, loading } = useProfile() as any
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  return profile.role === 'organization' 
    ? <Navigate to="/org/dashboard" replace /> 
    : <Navigate to="/student/dashboard" replace />
}
