import { SignupForm } from "@/components/auth/signup-form"
import { Leaf, TreePine } from "lucide-react"

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-primary/10">
          <Leaf className="h-24 w-24 leaf-sway" />
        </div>
        <div className="absolute top-20 right-20 text-accent/10">
          <TreePine className="h-32 w-32" />
        </div>
        <div className="absolute bottom-20 left-20 text-primary/10">
          <Leaf className="h-20 w-20 leaf-sway" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute bottom-10 right-10 text-accent/10">
          <Leaf className="h-16 w-16 leaf-sway" style={{ animationDelay: "2s" }} />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Leaf className="h-8 w-8 text-primary leaf-sway" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GameGreenEco
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Empowering Environmental Education
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  )
}