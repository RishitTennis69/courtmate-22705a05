
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Plus, Users, Lock, Globe, Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import CircleCreationModal from "@/components/CircleCreationModal"
import CircleDetailsModal from "@/components/CircleDetailsModal"

interface Circle {
  id: string
  name: string
  description: string
  location: string | null
  is_private: boolean
  member_count: number
  created_by: string
  created_at: string
  is_member?: boolean
}

export default function Circles() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [circles, setCircles] = useState<Circle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("my-circles")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCircles()
  }, [activeTab])

  const fetchCircles = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (activeTab === "my-circles") {
        // Fetch circles user is a member of
        const { data, error } = await supabase
          .from("circles")
          .select(`
            *,
            circle_members!inner(user_id)
          `)
          .eq("circle_members.user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setCircles((data || []).map(circle => ({ ...circle, is_member: true })))
      } else {
        // Fetch all public circles and private circles user is not a member of
        const { data: allCircles, error: circlesError } = await supabase
          .from("circles")
          .select("*")
          .order("created_at", { ascending: false })

        if (circlesError) throw circlesError

        // Get user's memberships
        const { data: memberships, error: memberError } = await supabase
          .from("circle_members")
          .select("circle_id")
          .eq("user_id", user.id)

        if (memberError) throw memberError

        const memberCircleIds = new Set(memberships?.map(m => m.circle_id) || [])
        
        const circlesWithMembership = (allCircles || []).map(circle => ({
          ...circle,
          is_member: memberCircleIds.has(circle.id)
        }))

        setCircles(circlesWithMembership)
      }
    } catch (error) {
      console.error("Error fetching circles:", error)
      toast({
        title: "Error",
        description: "Failed to load circles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const joinCircle = async (circleId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("circle_members")
        .insert({
          circle_id: circleId,
          user_id: user.id,
          role: "member"
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "You have joined the circle!"
      })

      fetchCircles()
    } catch (error) {
      console.error("Error joining circle:", error)
      toast({
        title: "Error",
        description: "Failed to join circle",
        variant: "destructive"
      })
    }
  }

  const openCircleDetails = (circle: Circle) => {
    setSelectedCircle(circle)
    setDetailsModalOpen(true)
  }

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "my-circles") {
      return matchesSearch && circle.is_member
    } else {
      return matchesSearch
    }
  })

  const myCircles = filteredCircles.filter(circle => circle.is_member)
  const discoverCircles = filteredCircles.filter(circle => !circle.is_member)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Circles</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Circle
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search circles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-circles">My Circles ({myCircles.length})</TabsTrigger>
          <TabsTrigger value="discover">Discover ({discoverCircles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-circles" className="space-y-4">
          {myCircles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCircles.map((circle) => (
                <Card key={circle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {circle.name}
                          {circle.is_private ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {circle.is_private ? "Private" : "Public"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{circle.description}</p>
                    
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
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => openCircleDetails(circle)}
                    >
                      View Circle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No circles yet</h3>
                <p className="text-muted-foreground mb-4">Create or join some circles to connect with other players</p>
                <Button onClick={() => setActiveTab("discover")}>
                  Discover Circles
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverCircles.map((circle) => (
              <Card key={circle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {circle.name}
                        {circle.is_private ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {circle.is_private ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{circle.description}</p>
                  
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
                  </div>

                  {!circle.is_private ? (
                    <Button className="w-full" onClick={() => joinCircle(circle.id)}>
                      Join Circle
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Private - Invite Only
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CircleCreationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCircleCreated={fetchCircles}
      />

      <CircleDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        circle={selectedCircle}
        onCircleDeleted={fetchCircles}
        onCircleLeft={fetchCircles}
      />
    </div>
  )
}
