import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, Send, Video } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function MissionSubmission() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mission, setMission] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [formData, setFormData] = useState({
    description: '',
    notes: '',
    files: [] as string[]
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id && user) {
      fetchMissionAndSubmission()
    }
  }, [id, user])

  const fetchMissionAndSubmission = async () => {
    try {
      // Fetch mission details
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single()

      if (missionError) {
        console.error('Error fetching mission:', missionError)
        toast.error("Failed to load mission")
        return
      }

      // Fetch existing submission
      const { data: submissionData } = await supabase
        .from('mission_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_id', id)
        .maybeSingle()

      setMission(missionData)
      setSubmission(submissionData)
      
      if (submissionData?.submission_data) {
        const data = submissionData.submission_data as any
        setFormData({
          description: data?.description || '',
          notes: data?.notes || '',
          files: submissionData.submission_files || []
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file')
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file size must be less than 100MB')
      return
    }

    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    setSubmitting(true)
    try {
      let videoUrl = null

      // Upload video if provided
      if (videoFile) {
        console.log('Uploading video file:', videoFile.name, 'Size:', videoFile.size)
        const fileExt = videoFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        console.log('Upload path:', fileName)
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('mission-videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading video:', uploadError)
          toast.error(`Failed to upload video: ${uploadError.message}`)
          setSubmitting(false)
          return
        }

        console.log('Video uploaded successfully:', uploadData)
        videoUrl = uploadData.path
        toast.success("Video uploaded successfully!")
      }

      const submissionData = {
        description: formData.description,
        notes: formData.notes,
        completedDate: new Date().toISOString()
      }

      const { error, data } = await supabase
        .from('mission_submissions')
        .upsert({
          user_id: user.id,
          mission_id: id,
          status: 'submitted',
          submission_data: submissionData,
          submission_files: formData.files,
          video_url: videoUrl,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error submitting mission:', error)
        toast.error("Failed to submit mission")
      } else {
        // Update local state immediately
        setSubmission(data)
        toast.success("Mission submitted successfully!")
        setTimeout(() => {
          navigate('/missions')
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting mission:', error)
      toast.error("Failed to submit mission")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5 flex items-center justify-center">
        <div>Loading mission...</div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5 flex items-center justify-center">
        <div>Mission not found</div>
      </div>
    )
  }

  const isAlreadySubmitted = submission?.status === 'submitted' || submission?.status === 'approved'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <EcoButton
            variant="ghost"
            onClick={() => navigate("/missions")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Missions
          </EcoButton>
        </div>

        {/* Mission Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{mission.title}</CardTitle>
            <p className="text-muted-foreground">{mission.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Instructions:</h4>
                <p className="text-sm text-muted-foreground">{mission.instructions}</p>
              </div>
              
              {Array.isArray(mission.requirements) && mission.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {mission.requirements.map((req: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {typeof req === 'string' ? req : 'Complete mission requirements'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <span>Points: <strong>{mission.points}</strong></span>
                <span>Time: <strong>{mission.estimated_time}</strong></span>
                <span>Difficulty: <strong>{mission.difficulty}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        {isAlreadySubmitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Mission Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {submission?.status === 'approved' ? 'Mission Approved!' : 'Submission Under Review'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {submission?.status === 'approved' 
                    ? 'Congratulations! Your mission has been approved and points have been awarded.'
                    : 'Your submission is being reviewed. You will be notified once it\'s approved.'}
                </p>
                {submission?.reviewer_notes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Reviewer Notes:</h4>
                    <p className="text-sm">{submission.reviewer_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
              <p className="text-muted-foreground">
                Provide details about how you completed this mission
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="description">Description of Work Completed</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you did to complete this mission..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-2"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information, challenges faced, or learnings..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="video-upload">Upload Video Proof (Optional)</Label>
                  <input
                    ref={videoInputRef}
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <div 
                    className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {videoPreview ? (
                      <div className="space-y-4">
                        <video 
                          src={videoPreview} 
                          controls 
                          className="w-full max-h-64 rounded-md mx-auto"
                        />
                        <EcoButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setVideoFile(null)
                            setVideoPreview(null)
                          }}
                        >
                          Remove Video
                        </EcoButton>
                      </div>
                    ) : (
                      <>
                        <Video className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Click to upload a video (MP4, WebM, MOV)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Maximum file size: 100MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <EcoButton
                  type="submit"
                  variant="eco"
                  className="w-full"
                  disabled={submitting || !formData.description.trim()}
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Mission
                    </>
                  )}
                </EcoButton>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}