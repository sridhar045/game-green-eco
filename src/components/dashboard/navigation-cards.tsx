import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { BookOpen, Target, Award, ArrowRight } from "lucide-react"

export function NavigationCards() {
  const navigate = useNavigate()

  const cards = [
    {
      title: "Interactive Lessons",
      description: "Learn about sustainability, climate action, and environmental protection through engaging content.",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/5",
      route: "/student/lessons",
      buttonText: "Start Learning"
    },
    {
      title: "Real-World Missions",
      description: "Take action in your community with hands-on environmental projects and challenges.",
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/5",
      route: "/student/missions",
      buttonText: "View Missions"
    },
    {
      title: "Available Badges",
      description: "Discover all badges you can earn by completing lessons and missions.",
      icon: Award,
      color: "text-eco-sun",
      bgColor: "bg-eco-sun/5",
      route: "/student/badges",
      buttonText: "View Badges"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover-shadow cursor-pointer transition-all duration-300 hover:scale-105">
          <CardHeader>
            <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-4`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <CardTitle className="text-xl">{card.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {card.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EcoButton
              variant="eco"
              onClick={() => navigate(card.route)}
              className="w-full flex items-center justify-center gap-2"
            >
              {card.buttonText}
              <ArrowRight className="h-4 w-4" />
            </EcoButton>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}