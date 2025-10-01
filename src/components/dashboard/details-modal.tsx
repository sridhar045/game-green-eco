import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, BookOpen, Target, Award, Calendar, Clock } from "lucide-react"

interface DetailsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'lessons' | 'missions' | 'badges'
  data: any[]
}

export function DetailsModal({ isOpen, onClose, type, data }: DetailsModalProps) {
  const getModalTitle = () => {
    switch (type) {
      case 'lessons':
        return 'Completed Lessons'
      case 'missions':
        return 'Completed Missions'
      case 'badges':
        return 'Earned Badges'
      default:
        return 'Details'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'lessons':
        return <BookOpen className="h-5 w-5" />
      case 'missions':
        return <Target className="h-5 w-5" />
      case 'badges':
        return <Award className="h-5 w-5" />
      default:
        return null
    }
  }

  const renderContent = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type} found
        </div>
      )
    }

    switch (type) {
      case 'lessons':
        return (
          <div className="space-y-4">
            {data.map((lesson, index) => (
              <Card key={lesson.id || index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(lesson.completed_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={lesson.progress_percentage || 100} className="h-2" />
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'missions':
        return (
          <div className="space-y-4">
            {data.map((mission, index) => {
              const missionData = mission.missions || {}
              return (
                <Card key={mission.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{missionData.title || 'Mission'}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{missionData.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <Badge variant="outline" className="capitalize">{missionData.difficulty}</Badge>
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <Target className="h-4 w-4" />
                            <span>{mission.points_awarded || missionData.points || 0} eco-points</span>
                          </div>
                          {mission.submitted_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Completed: {new Date(mission.submitted_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="default" 
                          className={
                            mission.status === 'approved' 
                              ? 'bg-primary/10 text-primary border-primary/20' 
                              : mission.status === 'rejected'
                              ? 'bg-red-500/10 text-red-600 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                          }
                        >
                          {mission.status === 'approved' ? 'Approved' : mission.status === 'rejected' ? 'Rejected' : 'Under Review'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )

      case 'badges':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((badge, index) => (
              <Card key={badge.id || index}>
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-medium mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Earned on {new Date(badge.earned_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="details-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}