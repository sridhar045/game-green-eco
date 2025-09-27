import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Profile {
  id: string
  email: string
  role: 'student' | 'organization'
  full_name?: string
  avatar_url?: string
  points?: number
  level?: number
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Mock profile data - in real app this would come from Supabase
      setProfile({
        id: user.id,
        email: user.email || '',
        role: 'student',
        full_name: user.user_metadata?.full_name || 'Eco Student',
        points: 1250,
        level: 5
      })
    }
    setLoading(false)
  }, [user])

  return { profile, loading }
}