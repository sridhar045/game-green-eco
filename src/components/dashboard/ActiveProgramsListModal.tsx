import { useProfile } from "@/hooks/useProfile"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, BookOpen, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"

interface ActiveProgramsListModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ActiveProgramsListModal({ isOpen, onClose }: ActiveProgramsListModalProps) {
    const { profile } = useProfile()
    const [missions, setMissions] = useState([])
    const [filteredmissions, setFilteredMissions] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStudents() {
            if (!profile?.organization_code || profile.role !== 'organization') return

            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('missions')
                    .select('title,id,description,points,difficulty,category,is_active')
                    .order('eco_points', { ascending: false })

                if (error) throw error
                setMissions(data || [])
                setFilteredMissions(data || [])
            } catch (error) {
                console.error('Error fetching missions:', error)
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
            setFilteredMissions(missions)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = missions.filter(mission =>
            mission.title?.toLowerCase().includes(query)
        )
        setFilteredMissions(filtered)
    }, [searchQuery, missions])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-accent" />
                        Available Missions
                    </DialogTitle>
                    <DialogDescription>
                        Browse all active missions available for students
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search missions by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Loading missions...</p>
                        </div>
                    ) : filteredmissions.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No missions found matching your search' : 'Missions not Available yet'}
                            </p>
                        </div>
                    ) : (
                        filteredmissions.map((mission) => (
                            <Card key={mission.id} className="hover-shadow transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1">{mission.title || 'Mission'}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <Badge className="capitalize">{mission.difficulty}</Badge>
                                                <div className="flex items-center gap-1 text-primary font-semibold">
                                                    <Target className="h-4 w-4" />
                                                    <span>{mission.points_awarded || mission.points || 0} eco-points</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge
                                                className={
                                                    mission.is_active
                                                        ? 'bg-primary/10 text-primary border-primary/20'
                                                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                }
                                            >
                                                {mission.is_active ? 'Active' : 'InActive'}
                                            </Badge>
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