
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Search, UserPlus } from "lucide-react"

interface User {
  id: string
  full_name: string | null
  profile_image_url: string | null
  location: string | null
}

interface CircleInviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleId: string
  circleName: string
}

export default function CircleInviteModal({ 
  open, 
  onOpenChange, 
  circleId, 
  circleName 
}: CircleInviteModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers()
    } else {
      setUsers([])
    }
  }, [searchTerm])

  const searchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, full_name, profile_image_url, location")
        .neq("id", user?.id)
        .ilike("full_name", `%${searchTerm}%`)
        .eq("is_active", true)
        .limit(10)

      if (error) throw error

      // Filter out users who are already members
      const { data: members } = await supabase
        .from("circle_members")
        .select("user_id")
        .eq("circle_id", circleId)

      const memberIds = new Set(members?.map(m => m.user_id) || [])
      const filteredUsers = (data || []).filter(u => !memberIds.has(u.id))

      setUsers(filteredUsers)
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const inviteUser = async (userId: string) => {
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from("circle_invitations")
        .insert({
          circle_id: circleId,
          inviter_id: user.id,
          invitee_id: userId
        })

      if (error) throw error

      setInvitedUsers(prev => new Set([...prev, userId]))
      
      toast({
        title: "Invitation Sent",
        description: "User has been invited to the circle"
      })
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {circleName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {users.map((searchUser) => (
              <div key={searchUser.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={searchUser.profile_image_url || ""} />
                    <AvatarFallback>
                      {searchUser.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{searchUser.full_name || "Unknown User"}</p>
                    {searchUser.location && (
                      <p className="text-xs text-muted-foreground">{searchUser.location}</p>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => inviteUser(searchUser.id)}
                  disabled={loading || invitedUsers.has(searchUser.id)}
                >
                  {invitedUsers.has(searchUser.id) ? (
                    "Invited"
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            ))}
            
            {searchTerm.trim() && users.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No users found
              </p>
            )}
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
