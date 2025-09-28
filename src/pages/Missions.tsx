import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Users, Clock, MapPin, ArrowLeft, CheckCircle, Award, TreePine } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMissions } from "@/hooks/useMissions"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { MissionDetailsModal } from "@/components/mission/mission-details-modal"
import { useState } from "react"

export default function Missions() {
  const navigate = useNavigate()
  const { missions, loading, startMission, submitMission } = useMissions()
  const { user } = useAuth()
  const [selectedMission, setSelectedMission] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleMissionClick = (mission: any) => {
    setSelectedMission(mission)
    setModalOpen(true)
  }

  const handleStartMission = async (missionId: string) => {
    if (user) {
      await startMission(missionId)
      toast.success("Mission started! Good luck!")
    }
  }

  const handleSubmitMission = async (missionId: string) => {
    if (user) {
      // Navigate to submission page
      navigate(`/mission/${missionId}/submit`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">Loading missions...</div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Available</Badge>
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Progress</Badge>
      case 'submitted':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Under Review</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-primary'
      case 'intermediate':
        return 'text-accent'
      case 'advanced':
        return 'text-eco-sun'
      default:
        return 'text-muted-foreground'
    }
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
          <h1 className="text-4xl font-bold mb-4">Real-World Missions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take action in your community with hands-on environmental projects. 
            Connect with others and make a real impact on our planet.
          </p>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {missions.map((mission) => {
            const status = mission.submission?.status || "not_started"
            
            return (
              <Card key={mission.id} className="hover-shadow transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{mission.title}</CardTitle>
                        {status === 'approved' && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <CardDescription className="text-sm mb-3">
                        {mission.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {mission.estimated_time}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {mission.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-3">{mission.instructions}</p>
                    </div>
                    
                    <EcoButton
                      onClick={() => handleMissionClick(mission)}
                      className="w-full"
                    >
                      View Details
                    </EcoButton>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      <MissionDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mission={selectedMission}
      />
    </div>
  )
}