import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Tables } from '@/integrations/supabase/types'

type Lesson = Tables<'lessons'>
type LessonProgress = Tables<'lesson_progress'>

interface LessonWithProgress extends Lesson {
  progress?: LessonProgress
}

export function useLessons() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<LessonWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLessons() {
      try {
        const { data: lessonsData, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('is_published', true)
          .order('order_index')

        if (error) {
          console.error('Error fetching lessons:', error)
          return
        }

        if (user) {
          // Fetch user progress for these lessons
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id)

          const lessonsWithProgress = lessonsData.map(lesson => {
            const progress = progressData?.find(p => p.lesson_id === lesson.id)
            return { ...lesson, progress }
          })

          setLessons(lessonsWithProgress)
        } else {
          setLessons(lessonsData)
        }
      } catch (error) {
        console.error('Error fetching lessons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [user])

  const startLesson = async (lessonId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_percentage: 0,
          is_completed: false,
          last_accessed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error starting lesson:', error)
      }
    } catch (error) {
      console.error('Error starting lesson:', error)
    }
  }

  const updateProgress = async (lessonId: string, percentage: number, completed: boolean = false) => {
    if (!user) return

    try {
      const updateData: any = {
        user_id: user.id,
        lesson_id: lessonId,
        progress_percentage: percentage,
        is_completed: completed,
        last_accessed_at: new Date().toISOString()
      }

      if (completed) {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(updateData)

      if (error) {
        console.error('Error updating progress:', error)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  return { lessons, loading, startLesson, updateProgress }
}