import { Trophy, Star, Sparkles, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface CelebrationToastProps {
  type: 'lesson' | 'mission' | 'level' | 'points'
  title: string
  message: string
  className?: string
}

export function CelebrationToast({ type, title, message, className }: CelebrationToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'lesson':
        return <Star className="h-6 w-6 text-yellow-500" />
      case 'mission':
        return <Award className="h-6 w-6 text-green-500" />
      case 'level':
        return <Trophy className="h-6 w-6 text-purple-500" />
      case 'points':
        return <Sparkles className="h-6 w-6 text-blue-500" />
    }
  }

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 animate-scale-in", className)}>
      <div className="flex-shrink-0 animate-pulse">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
