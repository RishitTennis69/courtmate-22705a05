
import { useState } from "react"
import { Plus, Users, Lock, Globe, Search, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for circles
const mockCircles = [
  {
    id: "1",
    name: "NYC Tennis Club",
    description: "Weekly matches and tournaments in Central Park area",
    memberCount: 24,
    isPrivate: false,
    isMember: true,
    recentActivity: "2 hours ago",
    location: "New York, NY",
    category: "Local Club"
  },
  {
    id: "2", 
    name: "Beginner Friendly",
    description: "A supportive community for players just starting out",
    memberCount: 156,
    isPrivate: false,
    isMember: false,
    recentActivity: "30 min ago", 
    location: "Online",
    category: "Skill Level"
  },
  {
    id: "3",
    name: "Weekend Warriors",
    description: "For players who can only play on weekends",
    memberCount: 89,
    isPrivate: true,
    isMember: true,
    recentActivity: "1 hour ago",
    location: "Multiple Cities", 
    category: "Schedule"
  }
]

// Mock data for recent posts
const mockPosts = [
  {
    id: "1",
    author: "Sarah Johnson",
    authorAvatar: "/placeholder.svg",
    circle: "NYC Tennis Club",
    content: "Anyone up for a doubles match this Saturday at 10 AM? Looking for one more player!",
    timestamp: "2 hours ago",
    likes: 5,
    comments: 3
  },
  {
    id: "2",
    author: "Mike Chen", 
    authorAvatar: "/placeholder.svg",
    circle: "Beginner Friendly",
    content: "Just finished my first tournament! Thanks to everyone in this group for the encouragement and tips 🎾",
    timestamp: "4 hours ago",
    likes: 12,
    comments: 8
  }
]

export default function Circles() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("my-circles")

  const filteredCircles = mockCircles.filter(circle =>
    circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circle.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const myCircles = filteredCircles.filter(circle => circle.isMember)
  const allCircles = filteredCircles

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Circles</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Circle
        </Button>
      </div>

      {/* Search */}
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
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="my-circles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCircles.map((circle) => (
              <Card key={circle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {circle.name}
                        {circle.isPrivate ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {circle.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{circle.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{circle.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{circle.location}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last activity: {circle.recentActivity}
                  </div>

                  <Button className="w-full" variant="outline">
                    View Circle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {myCircles.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No circles yet</h3>
                <p className="text-muted-foreground mb-4">Join some circles to connect with other players</p>
                <Button onClick={() => setActiveTab("discover")}>
                  Discover Circles
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCircles.filter(circle => !circle.isMember).map((circle) => (
              <Card key={circle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {circle.name}
                        {circle.isPrivate ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {circle.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{circle.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{circle.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{circle.location}</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    {circle.isPrivate ? "Request to Join" : "Join Circle"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feed" className="space-y-4">
          <div className="max-w-2xl">
            {mockPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{post.author}</span>
                        <span className="text-xs text-muted-foreground">in</span>
                        <Badge variant="outline" className="text-xs">{post.circle}</Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
