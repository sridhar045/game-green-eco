import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

interface Profile {
  id: string
  email: string
  role: 'student' | 'organization'
  display_name?: string
  avatar_url?: string
  eco_points?: number
  level?: number
  completed_lessons?: number
  completed_missions?: number
  streak_days?: number
  organization_name?: string
  region_district?: string
  region_state?: string
  region_country?: string
  gender?: string
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching profile:', error)
          setLoading(false)
          return
        }

        if (data) {
          setProfile({
            id: data.id,
            email: user.email || '',
            role: data.role as 'student' | 'organization',
            display_name: data.display_name || user.user_metadata?.full_name || 'Eco Student',
            avatar_url: data.avatar_url,
            eco_points: data.eco_points,
            level: data.level,
            completed_lessons: data.completed_lessons,
            completed_missions: data.completed_missions,
            streak_days: data.streak_days,
            organization_name: data.organization_name,
            region_district: data.region_district,
            region_state: data.region_state,
            region_country: data.region_country,
            gender: data.gender
          })
        } else {
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: user.user_metadata?.full_name || user.email,
              role: 'student'
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
          } else if (newProfile) {
            setProfile({
              id: newProfile.id,
              email: user.email || '',
              role: newProfile.role as 'student' | 'organization',
              display_name: newProfile.display_name,
              avatar_url: newProfile.avatar_url,
              eco_points: newProfile.eco_points,
              level: newProfile.level,
              completed_lessons: newProfile.completed_lessons,
              completed_missions: newProfile.completed_missions,
              streak_days: newProfile.streak_days,
              organization_name: newProfile.organization_name,
              region_district: newProfile.region_district,
              region_state: newProfile.region_state,
              region_country: newProfile.region_country,
              gender: newProfile.gender
            })
          }
        }
      } catch (error) {
        console.error('Error with profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  return { profile, loading }
}