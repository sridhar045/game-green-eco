import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Award, BookOpen, Target } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useProfile } from "@/hooks/useProfile"

interface Student {
  id: string
  display_name: string
  avatar_url: string | null
  eco_points: number
  level: number
  completed_lessons: number
  completed_missions: number
  streak_days: number
}

interface StudentsListModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StudentsListModal({ isOpen, onClose }: StudentsListModalProps) {
  const { profile } = useProfile()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      if (!profile?.organization_code || profile.role !== 'organization') return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, eco_points, level, completed_lessons, completed_missions, streak_days')
          .eq('role', 'student')
          .eq('organization_code', profile.organization_code)
          .order('eco_points', { ascending: false })

        if (error) throw error
        setStudents(data || [])
        setFilteredStudents(data || [])
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchStudents()
    }
  }, [isOpen, profile])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = students.filter(student =>
      student.display_name?.toLowerCase().includes(query)
    )
    setFilteredStudents(filtered)
  }, [searchQuery, students])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Students in Your Organization
          </DialogTitle>
          <DialogDescription>
            View and manage students linked to organization code: {profile?.organization_code}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No students found matching your search' : 'No students linked yet'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="hover-shadow transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {student.display_name?.charAt(0)?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{student.display_name || 'Student'}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          Level {student.level}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {student.eco_points} pts
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {student.completed_lessons} lessons
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {student.completed_missions} missions
                        </span>
                        {student.streak_days > 0 && (
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                            🔥 {student.streak_days} day streak
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
