
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Users, MapPin, Calendar, UserPlus, Settings, Trash2 } from "lucide-react"
import CircleChat from "./CircleChat"
import CircleInviteModal from "./CircleInviteModal"

interface Circle {
  id: string
  name: string
  description: string
  location: string | null
  is_private: boolean
  member_count: number
  created_by: string
  created_at: string
}

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  user_profiles: {
    full_name: string | null
    profile_image_url: string | null
  } | null
}

interface CircleDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circle: Circle | null
  onCircleDeleted: () => void
  onCircleLeft: () => void
}

export default function CircleDetailsModal({ 
  open, 
  onOpenChange, 
  circle,
  onCircleDeleted,
  onCircleLeft
}: CircleDetailsModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (circle) {
      fetchMembers()
    }
  }, [circle])

  const fetchMembers = async () => {
    if (!circle) return

    try {
      const { data, error } = await supabase
        .from("circle_members")
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq("circle_id", circle.id)
        .order("joined_at", { ascending: false })

      if (error) throw error

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(member => member.user_id) || [])]
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, full_name, profile_image_url")
        .in("id", userIds)

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      const membersWithProfiles = (data || []).map(member => ({
        ...member,
        user_profiles: profilesMap.get(member.user_id) || null
      }))

      setMembers(membersWithProfiles)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const deleteCircle = async () => {
    if (!circle || !user || circle.created_by !== user.id) return

    if (!confirm(`Are you sure you want to delete "${circle.name}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("circles")
        .delete()
        .eq("id", circle.id)

      if (error) throw error

      toast({
        title: "Circle Deleted",
        description: "The circle has been deleted successfully"
      })

      onOpenChange(false)
      onCircleDeleted()
    } catch (error) {
      console.error("Error deleting circle:", error)
      toast({
        title: "Error",
        description: "Failed to delete circle",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const leaveCircle = async () => {
    if (!circle || !user) return

    if (!confirm(`Are you sure you want to leave "${circle.name}"?`)) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("circle_members")
        .delete()
        .eq("circle_id", circle.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Left Circle",
        description: "You have left the circle"
      })

      onOpenChange(false)
      onCircleLeft()
    } catch (error) {
      console.error("Error leaving circle:", error)
      toast({
        title: "Error",
        description: "Failed to leave circle",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!circle) return null

  const isCreator = user?.id === circle.created_by
  const userMember = members.find(m => m.user_id === user?.id)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {circle.name}
              <Badge variant={circle.is_private ? "secondary" : "default"}>
                {circle.is_private ? "Private" : "Public"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-muted-foreground">{circle.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{circle.member_count} members</span>
              </div>
              {circle.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{circle.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(circle.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <Tabs defaultValue="chat" className="w-full">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                {isCreator && <TabsTrigger value="settings">Settings</TabsTrigger>}
              </TabsList>

              <TabsContent value="chat">
                <CircleChat circleId={circle.id} circleName={circle.name} />
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Members ({members.length})</h3>
                  {(isCreator || userMember?.role === 'admin') && circle.is_private && (
                    <Button onClick={() => setInviteModalOpen(true)} size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">
                            {member.user_profiles?.full_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {isCreator && (
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Circle Settings
                    </h3>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="destructive" 
                        onClick={deleteCircle}
                        disabled={loading}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Circle
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {!isCreator && (
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={leaveCircle}
                  disabled={loading}
                >
                  Leave Circle
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {circle.is_private && (
        <CircleInviteModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          circleId={circle.id}
          circleName={circle.name}
        />
      )}
    </>
  )
}
