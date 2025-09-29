import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Target, Award, Play, FileVideo, Upload } from "lucide-react"
import { useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface MissionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  mission: any
}

export function MissionDetailsModal({ isOpen, onClose, mission }: MissionDetailsModalProps) {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        toast.error("Only video files are allowed as proof")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmission = async () => {
    if (!user || !selectedFile) {
      toast.error("Please select a video file as proof")
      return
    }

    setSubmitting(true)
    try {
      // Create submission record
      const submissionData = {
        user_id: user.id,
        mission_id: mission.id,
        status: 'submitted',
        submission_data: {
          description,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type
        },
        submitted_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('mission_submissions')
        .upsert(submissionData, {
          onConflict: 'user_id,mission_id',
          ignoreDuplicates: false
        })

      if (error) throw error

      toast.success("Mission submitted successfully! Awaiting review.")
      onClose()
    } catch (error) {
      console.error('Error submitting mission:', error)
      toast.error("Failed to submit mission")
    } finally {
      setSubmitting(false)
    }
  }

  if (!mission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="mission-details-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {mission.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Mission Info */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="capitalize">
              {mission.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-primary">
              <Award className="h-4 w-4" />
              <span>{mission.points} points</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{mission.estimated_time}</span>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{mission.description}</p>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Instructions</h3>
              <p className="text-muted-foreground">{mission.instructions}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {mission.requirements && mission.requirements.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {mission.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Submission Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Submit Your Work</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                    placeholder="Describe your work and what you accomplished..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video Proof <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileVideo className="h-8 w-8 mx-auto text-primary" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <EcoButton
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change File
                        </EcoButton>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload video proof</p>
                        <EcoButton
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Select Video File
                        </EcoButton>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Only video files are accepted as proof of completion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <EcoButton variant="outline" onClick={onClose}>
              Cancel
            </EcoButton>
            <EcoButton 
              onClick={handleSubmission}
              disabled={!selectedFile || submitting}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Mission"}
            </EcoButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}