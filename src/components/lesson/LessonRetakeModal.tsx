import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { Clock, Target, Award, BookOpen, Play } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface LessonRetakeModalProps {
  isOpen: boolean
  onClose: () => void
  lesson: any
  quizScore?: number
  missions?: any[]
}

export function LessonRetakeModal({ isOpen, onClose, lesson, quizScore, missions }: LessonRetakeModalProps) {
  const navigate = useNavigate()

  const handleRetake = () => {
    onClose()
    navigate(`/lesson/${lesson.id}?retake=true`)
  }

  const handleStartMission = (missionId: string) => {
    onClose()
    navigate(`/mission/${missionId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="lesson-retake-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Retake Lesson
          </DialogTitle>
        </DialogHeader>
        
        <div id="lesson-retake-description" className="space-y-6">
          {/* Lesson Details */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration_minutes} min</span>
                </div>
                <Badge variant="outline" className="capitalize">{lesson.difficulty}</Badge>
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Target className="h-4 w-4" />
                  <span>25 eco-points (earned)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Quiz Score */}
          {quizScore !== undefined && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Previous Quiz Score</h4>
                  </div>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    {quizScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Missions */}
          {missions && missions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Linked Missions
              </h4>
              {missions.map((mission) => (
                <Card key={mission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{mission.title}</h5>
                        <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="outline" className="capitalize">{mission.difficulty}</Badge>
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <Target className="h-4 w-4" />
                            {mission.points} points
                          </span>
                        </div>
                      </div>
                      <EcoButton
                        size="sm"
                        onClick={() => handleStartMission(mission.id)}
                        disabled={mission.isCompleted}
                        variant={mission.isCompleted ? "outline" : "default"}
                      >
                        {mission.isCompleted ? "Completed" : "Start Mission"}
                      </EcoButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Retake Notice */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Note:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Retaking this lesson will not award additional eco-points</li>
                  <li>You'll watch the video again and see celebration animations</li>
                  <li>Quiz is disabled when retaking lessons</li>
                  <li>You can start any incomplete missions</li>
                  <li>After completing the video, you'll return to the lessons page</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <EcoButton
            onClick={handleRetake}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Play className="h-5 w-5" />
            Retake Lesson
          </EcoButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}