import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Star, PlayCircle, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Lessons() {
  const navigate = useNavigate()

  const lessons = [
    {
      id: 1,
      title: "Climate Change Basics",
      description: "Understanding the science behind climate change and its global impacts.",
      duration: "15 min",
      difficulty: "Beginner",
      progress: 100,
      completed: true,
      points: 50
    },
    {
      id: 2,
      title: "Renewable Energy Sources",
      description: "Explore solar, wind, and other sustainable energy solutions.",
      duration: "20 min",
      difficulty: "Intermediate",
      progress: 75,
      completed: false,
      points: 75
    },
    {
      id: 3,
      title: "Biodiversity Conservation",
      description: "Learn about protecting ecosystems and endangered species.",
      duration: "25 min",
      difficulty: "Advanced",
      progress: 0,
      completed: false,
      points: 100
    },
    {
      id: 4,
      title: "Sustainable Agriculture",
      description: "Discover farming practices that protect the environment.",
      duration: "18 min",
      difficulty: "Intermediate",
      progress: 30,
      completed: false,
      points: 80
    }
  ]

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
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="hover-shadow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {lesson.description}
                    </CardDescription>
                  </div>
                  {lesson.completed && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <Star className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {lesson.duration}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {lesson.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {lesson.points} pts
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} className="h-2" />
                  </div>
                  
                  <EcoButton
                    variant={lesson.completed ? "outline" : "eco"}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {lesson.completed ? "Review Lesson" : lesson.progress > 0 ? "Continue" : "Start Lesson"}
                  </EcoButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}