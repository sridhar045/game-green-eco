import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Star, PlayCircle, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLessons } from "@/hooks/useLessons"
import { useAuth } from "@/contexts/AuthContext"

export default function Lessons() {
  const navigate = useNavigate()
  const { lessons, loading, startLesson, updateProgress } = useLessons()
  const { user } = useAuth()

  const handleStartLesson = async (lessonId: string) => {
    if (user) {
      await startLesson(lessonId)
      console.log(`Starting lesson ${lessonId}`)
    }
  }

  const handleContinueLesson = async (lessonId: string, currentProgress: number) => {
    if (user) {
      console.log(`Continuing lesson ${lessonId} from ${currentProgress}%`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">Loading lessons...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <EcoButton
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </EcoButton>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Interactive Lessons</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about sustainability and environmental protection through engaging, 
            interactive content designed for all skill levels.
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => {
            const progress = lesson.progress?.progress_percentage || 0
            const isCompleted = lesson.progress?.is_completed || false
            
            return (
              <Card key={lesson.id} className="hover-shadow transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {lesson.description}
                      </CardDescription>
                    </div>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Star className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {lesson.duration_minutes} min
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Level {lesson.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <EcoButton
                      variant={isCompleted ? "outline" : "eco"}
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isCompleted}
                      onClick={() => {
                        if (isCompleted) return
                        if (progress > 0) {
                          handleContinueLesson(lesson.id, progress)
                        } else {
                          handleStartLesson(lesson.id)
                        }
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {isCompleted ? "Review Lesson" : progress > 0 ? "Continue" : "Start Lesson"}
                    </EcoButton>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}