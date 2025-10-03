import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, User, Calendar, FileText } from "lucide-react"
import { useMissionReview } from "@/hooks/useMissionReview"
import { useState } from "react"
import { toast } from "sonner"

interface MissionReviewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MissionReviewModal({ isOpen, onClose }: MissionReviewModalProps) {
  const { submissions, loading, approveSubmission, rejectSubmission } = useMissionReview()
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [approvalPoints, setApprovalPoints] = useState("")

  const handleApprove = async (submissionId: string, missionPoints: number) => {
    const points = parseInt(approvalPoints) || missionPoints
    const success = await approveSubmission(submissionId, points)
    if (success) {
      toast.success("Mission approved successfully!")
      setSelectedSubmission(null)
      setApprovalPoints("")
    } else {
      toast.error("Failed to approve mission")
    }
  }

  const handleReject = async (submissionId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    const success = await rejectSubmission(submissionId, rejectReason)
    if (success) {
      toast.success("Mission rejected")
      setSelectedSubmission(null)
      setRejectReason("")
    } else {
      toast.error("Failed to reject mission")
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="mission-review-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mission Review
            </DialogTitle>
          </DialogHeader>
          <div id="mission-review-description" className="text-center py-8">
            Loading submissions...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="mission-review-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mission Submissions Review
          </DialogTitle>
        </DialogHeader>
        
        <div id="mission-review-description" className="space-y-6">
          <p className="text-muted-foreground text-center">
            Review and approve student mission submissions from your organization
          </p>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending submissions to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{submission.mission?.title}</CardTitle>
                      <Badge variant="secondary">
                        {submission.mission?.points} points
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {submission.student_profile?.display_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(submission.submitted_at || '').toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Mission Description:</p>
                      <p className="text-sm text-muted-foreground">{submission.mission?.description}</p>
                    </div>

                    {submission.submission_data && (
                      <div className="space-y-3">
                        <p className="font-medium">Submission Details:</p>
                        {typeof submission.submission_data === 'object' && (
                          <div className="space-y-2">
                            {Object.entries(submission.submission_data as Record<string, unknown>).map(([key, value]) => {
                              const val = String(value ?? '')
                              const isVideoField = key.toLowerCase().includes('video') || key.toLowerCase().includes('url') || key.toLowerCase().includes('link')
                              const isYouTube = val.includes('youtube.com') || val.includes('youtu.be')
                              const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(val)
                              return (
                                <div key={key} className="bg-muted/50 p-3 rounded-md">
                                  <p className="text-sm font-medium capitalize mb-1">{key.replace(/_/g, ' ')}:</p>
                                  {isVideoField ? (
                                    <div className="space-y-2">
                                      {isYouTube ? (
                                        <div className="space-y-2">
                                          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                                            Watch Video →
                                          </a>
                                          <div className="aspect-video rounded-md overflow-hidden">
                                            <iframe
                                              src={`https://www.youtube.com/embed/${val.includes('youtu.be') ? val.split('youtu.be/')[1].split('?')[0] : new URLSearchParams(new URL(val).search).get('v')}`}
                                              className="w-full h-full"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                            />
                                          </div>
                                        </div>
                                      ) : isDirectVideo ? (
                                        <video controls className="w-full rounded-md" src={val}>
                                          Your browser does not support video playback.
                                        </video>
                                      ) : (
                                        <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                          {val}
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm">{val}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedSubmission === submission.id ? (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="points">Award Points</Label>
                            <Input
                              id="points"
                              type="number"
                              placeholder={`Default: ${submission.mission?.points}`}
                              value={approvalPoints}
                              onChange={(e) => setApprovalPoints(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason (if rejecting)</Label>
                            <Textarea
                              id="reason"
                              placeholder="Provide reason for rejection..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <EcoButton
                            onClick={() => handleApprove(submission.id, submission.mission?.points || 0)}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </EcoButton>
                          <EcoButton
                            variant="outline"
                            onClick={() => handleReject(submission.id)}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </EcoButton>
                          <EcoButton
                            variant="ghost"
                            onClick={() => {
                              setSelectedSubmission(null)
                              setRejectReason("")
                              setApprovalPoints("")
                            }}
                          >
                            Cancel
                          </EcoButton>
                        </div>
                      </div>
                    ) : (
                      <EcoButton
                        onClick={() => setSelectedSubmission(submission.id)}
                        variant="outline"
                        className="w-full"
                      >
                        Review Submission
                      </EcoButton>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
