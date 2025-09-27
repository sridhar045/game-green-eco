import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && user) {
      fetchLesson()
    }
  }, [id, user])

  const fetchLesson = async () => {
    try {
      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (lessonError) {
        console.error('Error fetching lesson:', lessonError)
        toast.error("Failed to load lesson")
        return
      }

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', id)
        .maybeSingle()

      setLesson(lessonData)
      setProgress(progressData?.progress_percentage || 0)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const updateProgress = async (newProgress: number, completed: boolean = false) => {
    if (!user || !id) return

    try {
      const updateData: any = {
        user_id: user.id,
        lesson_id: id,
        progress_percentage: newProgress,
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
      } else {
        setProgress(newProgress)
        if (completed) {
          toast.success("Lesson completed! Well done!")
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleComplete = () => {
    updateProgress(100, true)
    setTimeout(() => {
      navigate('/lessons')
    }, 2000)
  }

  const handleNext = () => {
    const newProgress = Math.min(progress + 25, 100)
    updateProgress(newProgress)
    
    if (newProgress >= 100) {
      handleComplete()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5 flex items-center justify-center">
        <div>Loading lesson...</div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5 flex items-center justify-center">
        <div>Lesson not found</div>
      </div>
    )
  }

  const isCompleted = progress >= 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <EcoButton
            variant="ghost"
            onClick={() => navigate("/lessons")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </EcoButton>
        </div>

        {/* Lesson Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            <p className="text-muted-foreground">{lesson.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Mock Video Player */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-primary" />
                    ) : (
                      <Play className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <p className="text-lg font-medium">Interactive Lesson Content</p>
                  <p className="text-sm text-muted-foreground">Duration: {lesson.duration_minutes} minutes</p>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="prose max-w-none">
                <h3>Lesson Overview</h3>
                <p>
                  This interactive lesson covers important environmental concepts related to {lesson.category.toLowerCase()}. 
                  You'll learn practical applications and real-world examples that you can apply in your daily life.
                </p>
                
                <h4>What You'll Learn:</h4>
                <ul>
                  <li>Understanding the fundamental concepts</li>
                  <li>Practical applications and examples</li>
                  <li>How to implement sustainable practices</li>
                  <li>Measuring your environmental impact</li>
                </ul>

                <div className="bg-primary/10 p-4 rounded-lg mt-6">
                  <h4 className="text-primary mb-2">Interactive Exercise</h4>
                  <p>Complete this section to earn progress towards your lesson completion!</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-6 border-t">
                <EcoButton
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </EcoButton>

                {!isCompleted ? (
                  <EcoButton
                    variant="eco"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Next Section
                  </EcoButton>
                ) : (
                  <EcoButton
                    variant="outline"
                    onClick={() => navigate('/lessons')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Lesson Complete
                  </EcoButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}