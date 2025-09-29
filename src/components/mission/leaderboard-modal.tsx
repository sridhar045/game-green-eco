import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trophy, Medal, Award, MapPin, Users, TreePine } from "lucide-react"
import { useLeaderboardData } from "@/hooks/useLeaderboardData"
import { useStudentLeaderboard } from "@/hooks/useStudentLeaderboard"
import { useProfile } from "@/hooks/useProfile"

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { profile } = useProfile()
  const orgLeaderboard = useLeaderboardData()
  const studentLeaderboard = useStudentLeaderboard()
  
  // Use student leaderboard for students, organization leaderboard for organizations
  const isStudentView = profile?.role === 'student'
  const { leaderboardData, loading, userRank } = isStudentView ? studentLeaderboard : orgLeaderboard

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary" 
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="leaderboard-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {isStudentView ? 'Student Leaderboard' : 'Regional Eco-Points Leaderboard'}
            </DialogTitle>
          </DialogHeader>
          <div id="leaderboard-description" className="text-center py-8">
            Loading leaderboard...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="leaderboard-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {isStudentView ? 'Student Leaderboard' : 'Regional Eco-Points Leaderboard'}
          </DialogTitle>
        </DialogHeader>
        
        <div id="leaderboard-description" className="space-y-6">
          <p className="text-muted-foreground text-center">
            {isStudentView 
              ? 'See how students are ranking based on their eco-points' 
              : 'See how organizations across different regions are making an environmental impact'
            }
          </p>

          {/* User's Position */}
          {userRank && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-primary" />
                  {isStudentView ? 'Your Rank' : 'Your Organization\'s Rank'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankIcon(userRank.rank)}
                    <div>
                      <p className="font-semibold">
                        {isStudentView ? (userRank as any).display_name : (userRank as any).organization_name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {isStudentView 
                          ? `${(userRank as any).organization_name} - ${(userRank as any).region_district}, ${(userRank as any).region_state}`
                          : `${(userRank as any).region_district}, ${(userRank as any).region_state}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {isStudentView ? (userRank as any).eco_points : (userRank as any).total_eco_points}
                    </p>
                    <p className="text-sm text-muted-foreground">eco-points</p>
                    {isStudentView && (
                      <p className="text-xs text-muted-foreground">
                        Level {(userRank as any).level}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Top Organizations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isStudentView ? 'Top Students' : 'Top Organizations by Region'}
            </h3>
            <div className="space-y-3">
              {leaderboardData?.map((entry, index) => {
                const rank = index + 1
                return (
                  <Card key={isStudentView ? entry.user_id : `${entry.organization_name}-${entry.region_district}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRankIcon(rank)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {isStudentView ? (entry as any).display_name : (entry as any).organization_name}
                              </p>
                              <Badge variant={getRankBadgeVariant(rank)} className="text-xs">
                                Rank #{rank}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {isStudentView 
                                ? `${(entry as any).organization_name} - ${(entry as any).region_district}, ${(entry as any).region_state}` 
                                : `${(entry as any).region_district}, ${(entry as any).region_state}, ${(entry as any).region_country}`
                              }
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              {isStudentView ? (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    Level {(entry as any).level}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {(entry as any).completed_lessons} lessons
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {(entry as any).completed_missions} missions
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {(entry as any).student_count} students
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {(entry as any).total_lessons_completed} lessons
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {(entry as any).total_missions_completed} missions
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {isStudentView ? (entry as any).eco_points : (entry as any).total_eco_points}
                          </p>
                          <p className="text-xs text-muted-foreground">eco-points</p>
                          {!isStudentView && (
                            <p className="text-xs text-muted-foreground">
                              Avg: {Math.round(Number((entry as any).avg_eco_points))} pts/student
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {leaderboardData?.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leaderboard data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete lessons and missions to see your organization on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}