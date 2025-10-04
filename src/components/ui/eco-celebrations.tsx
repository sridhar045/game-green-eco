import { useEffect, useState } from "react"

interface EcoCelebrationsProps {
  points?: number
  levelFrom?: number
  levelTo?: number
  onDone?: () => void
}

export function EcoCelebrations({ points, levelFrom, levelTo, onDone }: EcoCelebrationsProps) {
  const [showPoints, setShowPoints] = useState(false)
  const [showLevel, setShowLevel] = useState(false)

  useEffect(() => {
    if (points && points > 0) {
      setShowPoints(true)
      const t = setTimeout(() => setShowPoints(false), 2500)
      return () => clearTimeout(t)
    }
  }, [points])

  useEffect(() => {
    if (levelFrom !== undefined && levelTo !== undefined && levelTo > levelFrom) {
      setShowLevel(true)
      const t = setTimeout(() => setShowLevel(false), 3000)
      return () => clearTimeout(t)
    }
  }, [levelFrom, levelTo])

  useEffect(() => {
    if (!showPoints && !showLevel) onDone?.()
  }, [showPoints, showLevel, onDone])

  return (
    <div aria-hidden className="pointer-events-none">
      {showPoints && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Burst */}
            <div className="absolute inset-0 animate-enter flex items-center justify-center">
              <div className="bg-primary/10 rounded-full w-48 h-48 blur-2xl" />
            </div>
            {/* Floating leaves/points */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-primary animate-fade-in"
                  style={{
                    left: `${(i * 7) % 100}%`,
                    top: `${(i * 11) % 100}%`,
                    animationDelay: `${i * 60}ms`
                  }}
                >
                  🌿
                </span>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 py-3 rounded-full bg-background/80 backdrop-blur border border-primary/20 animate-scale-in">
                <span className="text-2xl font-bold text-primary">+{points} eco-points!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLevel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="px-6 py-5 rounded-2xl bg-background/80 backdrop-blur border border-accent/30 shadow-xl animate-enter">
            <div className="text-sm text-muted-foreground mb-1">Level Up</div>
            <div className="text-2xl font-bold mb-3">Level {levelFrom} → {levelTo}</div>
            <div className="w-72 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent animate-[widen_2s_ease-out_forwards]" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
