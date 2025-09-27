import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Users, Clock, MapPin, ArrowLeft, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Missions() {
  const navigate = useNavigate()

  const missions = [
    {
      id: 1,
      title: "Community Garden Project",
      description: "Help establish a sustainable garden in your local community center.",
      location: "Downtown Community Center",
      participants: 24,
      maxParticipants: 30,
      duration: "2 weeks",
      status: "active",
      progress: 65,
      points: 200,
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Beach Cleanup Initiative",
      description: "Join fellow eco-warriors to clean up our local beaches and waterways.",
      location: "Sunset Beach",
      participants: 45,
      maxParticipants: 50,
      duration: "1 day",
      status: "active",
      progress: 90,
      points: 150,
      difficulty: "Beginner"
    },
    {
      id: 3,
      title: "Urban Wildlife Survey",
      description: "Document and track local wildlife populations in urban environments.",
      location: "Central Park Area",
      participants: 12,
      maxParticipants: 20,
      duration: "3 weeks",
      status: "active",
      progress: 30,
      points: 300,
      difficulty: "Advanced"
    },
    {
      id: 4,
      title: "Solar Panel Installation",
      description: "Assist in installing solar panels at local schools and community buildings.",
      location: "Greenfield Elementary",
      participants: 15,
      maxParticipants: 15,
      duration: "1 week",
      status: "completed",
      progress: 100,
      points: 250,
      difficulty: "Intermediate"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Active</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-primary'
      case 'Intermediate':
        return 'text-accent'
      case 'Advanced':
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
          {missions.map((mission) => (
            <Card key={mission.id} className="hover-shadow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{mission.title}</CardTitle>
                      {mission.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardDescription className="text-sm mb-3">
                      {mission.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(mission.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {mission.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {mission.participants}/{mission.maxParticipants}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {mission.duration}
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
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{mission.progress}%</span>
                    </div>
                    <Progress value={mission.progress} className="h-2" />
                  </div>
                  
                  <EcoButton
                    variant={mission.status === 'completed' ? "outline" : "eco"}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={mission.participants >= mission.maxParticipants && mission.status !== 'completed'}
                  >
                    <Target className="h-4 w-4" />
                    {mission.status === 'completed' 
                      ? "View Results" 
                      : mission.participants >= mission.maxParticipants 
                        ? "Mission Full" 
                        : "Join Mission"
                    }
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