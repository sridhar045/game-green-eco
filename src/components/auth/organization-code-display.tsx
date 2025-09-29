import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, Building2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface OrganizationCodeDisplayProps {
  organizationCode: string
  organizationName: string
  onContinue: () => void
}

export function OrganizationCodeDisplay({ 
  organizationCode, 
  organizationName,
  onContinue 
}: OrganizationCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organizationCode)
      setCopied(true)
      toast.success("Organization code copied to clipboard!")
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast.error("Failed to copy code")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Organization Created!</CardTitle>
        <CardDescription>
          Your organization has been successfully registered
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{organizationName}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share this code with your students to allow them to join your organization
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Your Organization Code
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge 
                variant="outline" 
                className="text-2xl font-mono px-4 py-2 bg-background border-primary/30 text-primary"
              >
                {organizationCode}
              </Badge>
              <EcoButton
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="p-2"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </EcoButton>
            </div>
            <p className="text-xs text-muted-foreground">
              Click the copy icon to copy this code
            </p>
          </div>
        </div>

        <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
          <h4 className="font-medium text-accent mb-2">Important Notes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Students will need this code to join your organization</li>
            <li>• Keep this code secure and only share with authorized students</li>
            <li>• You can find this code in your profile anytime</li>
            <li>• Students' mission submissions will be sent to you for review</li>
          </ul>
        </div>

        <EcoButton onClick={onContinue} className="w-full">
          Continue to Dashboard
        </EcoButton>
      </CardContent>
    </Card>
  )
}