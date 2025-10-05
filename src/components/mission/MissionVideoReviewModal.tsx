import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EcoButton } from "@/components/ui/eco-button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface MissionVideoReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
  onApprove: (submissionId: string, points: number) => Promise<boolean>
  onReject: (submissionId: string, reason: string) => Promise<boolean>
}

export function MissionVideoReviewModal({ 
  isOpen, 
  onClose, 
  submission,
  onApprove,
  onReject 
}: MissionVideoReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("")
  const [approvalPoints, setApprovalPoints] = useState("")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideo() {
      if (!submission?.video_url) {
        setLoading(false)
        return
      }

      try {
        const isHttp = typeof submission.video_url === 'string' && /^https?:\/\//i.test(submission.video_url)
        if (isHttp) {
          // Direct URL (already accessible)
          setVideoUrl(submission.video_url)
        } else {
          // Treat as storage path within mission-videos bucket
          const path = submission.video_url as string
          const { data, error } = await supabase.storage
            .from('mission-videos')
            .createSignedUrl(path, 3600) // 1 hour expiry

          if (error) {
            console.error('Error getting signed URL:', error)
            toast.error('Failed to load video')
            setVideoUrl(null)
          } else {
            setVideoUrl(data.signedUrl)
          }
        }
      } catch (error) {
        console.error('Error loading video:', error)
        toast.error('Failed to load video')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && submission) {
      setLoading(true)
      loadVideo()
    }
  }, [isOpen, submission])

  const handleApprove = async () => {
    const points = parseInt(approvalPoints) || submission.mission?.points || 0
    const success = await onApprove(submission.id, points)
    if (success) {
      setApprovalPoints("")
      onClose()
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    const success = await onReject(submission.id, rejectReason)
    if (success) {
      setRejectReason("")
      onClose()
    }
  }

  if (!submission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="video-review-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EcoButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </EcoButton>
            Review Submission: {submission.mission?.title}
          </DialogTitle>
        </DialogHeader>
        
        <div id="video-review-description" className="space-y-6">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden">
            {loading ? (
              <div className="aspect-video flex items-center justify-center text-white">
                Loading video...
              </div>
            ) : videoUrl ? (
              <video
                controls
                className="w-full aspect-video"
                src={videoUrl}
                controlsList="nodownload"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="aspect-video flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="mb-2">No video submitted</p>
                  <p className="text-sm text-muted-foreground">Student did not upload a video for this mission</p>
                </div>
              </div>
            )}
          </div>

          {/* Review Actions */}
          <div className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Award Points</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder={`Default: ${submission.mission?.points || 0}`}
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
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <EcoButton
                onClick={handleApprove}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </EcoButton>
              <EcoButton
                variant="outline"
                onClick={handleReject}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </EcoButton>
              <EcoButton
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </EcoButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}