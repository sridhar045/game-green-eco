/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Award, Target } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { VideoPlayer } from "@/components/lesson/VideoPlayer"
import { LessonQuiz } from "@/components/lesson/LessonQuiz"
import { LessonMissions } from "@/components/lesson/LessonMissions"

enum LessonStage {
  VIDEO = 'video',
  QUIZ = 'quiz',
  MISSIONS = 'missions',
  COMPLETED = 'completed'
}

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState<LessonStage>(LessonStage.VIDEO)
  const [videoProgress, setVideoProgress] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMissions, setHasMissions] = useState(false)

  // Mock quiz questions with sample video - in real app, fetch from Supabase
  const quizQuestions = [
    {
      id: '1',
      question: 'What is the primary benefit of renewable energy sources?',
      options: [
        'They are cheaper to install',
        'They reduce greenhouse gas emissions',
        'They require no maintenance',
        'They work only in sunny weather'
      ],
      correctAnswer: 1,
      explanation: 'Renewable energy sources like solar and wind significantly reduce greenhouse gas emissions compared to fossil fuels, helping combat climate change.'
    },
    {
      id: '2',
      question: 'Which of the following is the most effective way to reduce water consumption at home?',
      options: [
        'Taking longer showers',
        'Running dishwasher when full',
        'Leaving faucets running',
        'Using more plastic bottles'
      ],
      correctAnswer: 1,
      explanation: 'Running your dishwasher only when it\'s full maximizes efficiency and significantly reduces water waste compared to washing dishes by hand or running partial loads.'
    },
    {
      id: '3',
      question: 'What percentage of global waste could be reduced through proper recycling?',
      options: ['10-20%', '30-40%', '50-70%', '80-90%'],
      correctAnswer: 2,
      explanation: 'Studies show that 50-70% of global waste could be significantly reduced through proper recycling, composting, and waste reduction practices.'
    }
  ]

  // Sample video URL - in real app, this would come from lesson.content.video_url
  const sampleVideoUrl = lesson?.content?.video_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

  useEffect(() => {
    if (id && user) {
      fetchLesson()
      checkForMissions()
    }
  }, [id, user])

  const checkForMissions = async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('missions')
      .select('id')
      .eq('lesson_id', id)
      .eq('is_active', true)
      .limit(1)
    
    setHasMissions(!error && data && data.length > 0)
  }

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
        .upsert(updateData, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error updating progress:', error)
      } else {
        setProgress(newProgress)
        if (completed) {
          toast.success("Lesson completed! Well done!")
          setCurrentStage(LessonStage.COMPLETED)
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleVideoComplete = () => {
    setVideoProgress(100)
    setProgress(33) // 33% for video completion
    updateProgress(33)
    setCurrentStage(LessonStage.QUIZ)
    toast.success("Video completed! Time for the quiz.")
  }

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress)
    const videoProgressWeight = (progress / 100) * 33
    setProgress(videoProgressWeight)
    updateProgress(videoProgressWeight)
  }

  const handleQuizComplete = (score: number) => {
    setQuizScore(score)
    
    if (!hasMissions) {
      // No missions, complete lesson at 100%
      const finalProgress = 100
      setProgress(finalProgress)
      updateProgress(finalProgress, true)
      setCurrentStage(LessonStage.COMPLETED)
      toast.success(`Great job! You scored ${score}%. Lesson completed!`)
    } else {
      // Has missions, move to missions stage
      const quizProgressWeight = 67
      setProgress(quizProgressWeight)
      updateProgress(quizProgressWeight)
      setCurrentStage(LessonStage.MISSIONS)
      
      if (score >= 70) {
        toast.success(`Great job! You scored ${score}%. Now check out the missions!`)
      } else {
        toast.info(`You scored ${score}%. You can still proceed to missions!`)
      }
    }
  }

  const handleMissionStart = () => {
    const finalProgress = 100
    setProgress(finalProgress)
    updateProgress(finalProgress, true)
  }

  const getStageProgress = () => {
    switch (currentStage) {
      case LessonStage.VIDEO:
        return Math.min(33, (videoProgress / 100) * 33)
      case LessonStage.QUIZ:
        return 33
      case LessonStage.MISSIONS:
        return 67
      case LessonStage.COMPLETED:
        return 100
      default:
        return 0
    }
  }

  const getCurrentStageComponent = () => {
    switch (currentStage) {
      case LessonStage.VIDEO:
        return (
          <VideoPlayer
            videoUrl={sampleVideoUrl}
            onVideoComplete={handleVideoComplete}
            onProgressUpdate={handleVideoProgress}
            duration={lesson?.duration_minutes || 10}
          />
        )
      case LessonStage.QUIZ:
        return (
          <LessonQuiz
            questions={quizQuestions}
            onQuizComplete={handleQuizComplete}
          />
        )
      case LessonStage.MISSIONS:
        return (
          <div className="space-y-4">
            <LessonMissions
              lessonId={id!}
              onMissionStart={handleMissionStart}
            />
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Want to complete this lesson without missions?
                  </p>
                  <EcoButton
                    variant="outline"
                    onClick={() => {
                      updateProgress(100, true)
                      toast.success("Lesson marked as complete!")
                      setTimeout(() => navigate('/lessons'), 1000)
                    }}
                  >
                    Complete Lesson
                  </EcoButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case LessonStage.COMPLETED:
        return (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Lesson Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Congratulations! You've successfully completed this lesson.
              </p>
              <EcoButton onClick={() => navigate('/lessons')}>
                Back to Lessons
              </EcoButton>
            </CardContent>
          </Card>
        )
      default:
        return null
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

        {/* Lesson Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            <p className="text-muted-foreground">{lesson.description}</p>
            
            {/* Stage Indicator */}
            <div className="flex items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                currentStage === LessonStage.VIDEO ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <BookOpen className="h-4 w-4" />
                Video
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                currentStage === LessonStage.QUIZ ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Award className="h-4 w-4" />
                Quiz
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                currentStage === LessonStage.MISSIONS ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Target className="h-4 w-4" />
                Missions
              </div>
            </div>
            
            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(getStageProgress())}%</span>
              </div>
              <Progress value={getStageProgress()} className="h-3" />
            </div>
          </CardHeader>
        </Card>

        {/* Current Stage Content */}
        {getCurrentStageComponent()}
      </div>
    </div>
  )
}