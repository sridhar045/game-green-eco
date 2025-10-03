import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { EcoButton } from '@/components/ui/eco-button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react'
import { toast } from 'sonner'

interface VideoPlayerProps {
  videoUrl?: string
  onVideoComplete: () => void
  onProgressUpdate: (progress: number) => void
  duration: number
  userId?: string
  lessonId?: string
}

export function VideoPlayer({ videoUrl, onVideoComplete, onProgressUpdate, duration, userId, lessonId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      setCurrentTime(video.currentTime)
      const progress = (video.currentTime / video.duration) * 100
      setVideoProgress(progress)
      onProgressUpdate(progress)
      
      // Save video progress to localStorage for resume functionality
      const storageKey = `video_progress_${userId || 'anon'}_${lessonId || videoUrl || 'unknown'}`
      localStorage.setItem(storageKey, video.currentTime.toString())
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onVideoComplete()
      toast.success("Video completed! Ready for quiz.")
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('loadedmetadata', () => {
      // Resume from saved progress if available
      if (videoUrl) {
        const savedProgress = localStorage.getItem(`video_progress_${videoUrl}`)
        if (savedProgress) {
          const savedTime = parseFloat(savedProgress)
          video.currentTime = savedTime
          setCurrentTime(savedTime)
        }
      }
    })

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('loadedmetadata', () => {})
    }
  }, [onVideoComplete, onProgressUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const seekTime = (value[0] / 100) * video.duration
    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Mock video if no URL provided
  if (!videoUrl) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary/30 transition-colors"
                   onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="h-10 w-10 text-primary" />
                ) : (
                  <Play className="h-10 w-10 text-primary ml-1" />
                )}
              </div>
              <p className="text-lg font-medium mb-2">Environmental Awareness Lesson</p>
              <p className="text-sm text-muted-foreground">Interactive video content - {duration} minutes</p>
            </div>
            
            {/* Mock progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <div className="flex items-center gap-4 text-white">
                <EcoButton
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </EcoButton>
                
                <EcoButton
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </EcoButton>
                
                <EcoButton
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </EcoButton>
                
                <div className="flex-1 mx-4">
                  <Progress 
                    value={videoProgress} 
                    className="h-1 cursor-pointer" 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const percent = ((e.clientX - rect.left) / rect.width) * 100
                      handleSeek([percent])
                      // Simulate video completion when reaching end
                      if (percent >= 95) {
                        setTimeout(onVideoComplete, 1000)
                      }
                    }}
                  />
                </div>
                
                <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration * 60)}</span>
                
                <EcoButton
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </EcoButton>
                
                <EcoButton
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </EcoButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-4 text-white">
              <EcoButton
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </EcoButton>
              
              <EcoButton
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </EcoButton>
              
              <EcoButton
                variant="ghost"
                size="sm"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </EcoButton>
              
              <div className="flex-1 mx-4">
                <Progress 
                  value={videoProgress} 
                  className="h-1 cursor-pointer"
                />
              </div>
              
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 0)}
              </span>
              
              <EcoButton
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </EcoButton>
              
              <EcoButton
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </EcoButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}