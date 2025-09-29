import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, User, Building2, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { OrganizationCodeDisplay } from "./organization-code-display"

interface SignupData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
  role: string
  organizationName?: string
  organizationCode?: string
  regionDistrict: string
  regionState: string
  regionCountry: string
  gender?: string
}

export function MultiStepSignup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    role: "",
    organizationName: "",
    organizationCode: "",
    regionDistrict: "",
    regionState: "",
    regionCountry: "India",
    gender: ""
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return signupData.email && signupData.password && signupData.confirmPassword && 
               signupData.password === signupData.confirmPassword
      case 2:
        return signupData.displayName && signupData.role && 
               (signupData.role !== 'organization' || signupData.organizationName) &&
               (signupData.role !== 'student' || signupData.organizationCode)
      case 3:
        return signupData.regionDistrict && signupData.regionState && signupData.regionCountry
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      await signUp(signupData.email, signupData.password, {
        data: {
          display_name: signupData.displayName,
          role: signupData.role,
          organization_name: signupData.organizationName,
          organization_code: signupData.organizationCode,
          region_district: signupData.regionDistrict,
          region_state: signupData.regionState,
          region_country: signupData.regionCountry,
          gender: signupData.gender
        }
      })
      
      toast.success("Account created successfully!")
      
      // For organizations, we'll need to fetch the generated code from the profile
      // This will be handled by the dashboard after redirect
      navigate("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-semibold">Account Information</h2>
              <p className="text-muted-foreground">Create your account credentials</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Full Name *</Label>
                <Input
                  id="displayName"
                  value={signupData.displayName}
                  onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={signupData.role} 
                  onValueChange={(value) => setSignupData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {signupData.role === 'organization' && (
                <div>
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    value={signupData.organizationName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="Enter organization name"
                  />
                </div>
              )}
              
              {signupData.role === 'student' && (
                <div>
                  <Label htmlFor="organizationCode">Organization Code *</Label>
                  <Input
                    id="organizationCode"
                    value={signupData.organizationCode}
                    onChange={(e) => setSignupData(prev => ({ ...prev, organizationCode: e.target.value }))}
                    placeholder="Enter 4-digit organization code"
                    maxLength={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 4-digit code provided by your organization
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Select 
                  value={signupData.gender} 
                  onValueChange={(value) => setSignupData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-semibold">Location Information</h2>
              <p className="text-muted-foreground">Help us understand your region</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="regionCountry">Country *</Label>
                <Select 
                  value={signupData.regionCountry} 
                  onValueChange={(value) => setSignupData(prev => ({ ...prev, regionCountry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="regionState">State/Province *</Label>
                <Input
                  id="regionState"
                  value={signupData.regionState}
                  onChange={(e) => setSignupData(prev => ({ ...prev, regionState: e.target.value }))}
                  placeholder="Enter your state or province"
                />
              </div>
              
              <div>
                <Label htmlFor="regionDistrict">District/City *</Label>
                <Input
                  id="regionDistrict"
                  value={signupData.regionDistrict}
                  onChange={(e) => setSignupData(prev => ({ ...prev, regionDistrict: e.target.value }))}
                  placeholder="Enter your district or city"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleOrgCodeContinue = () => {
    navigate("/dashboard")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Create Account</CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between">
          {currentStep > 1 && (
            <EcoButton 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </EcoButton>
          )}
          
          <div className="ml-auto">
            {currentStep < totalSteps ? (
              <EcoButton 
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </EcoButton>
            ) : (
              <EcoButton 
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || loading}
                className="flex items-center gap-2"
              >
                {loading ? "Creating..." : "Create Account"}
              </EcoButton>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}