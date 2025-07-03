
import { useState } from "react"
import { Search, Filter, MapPin, Calendar, Star, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import LocationAutocomplete from "@/components/LocationAutocomplete"

// Mock data for demonstration
const mockPlayers = [
  {
    id: "1",
    name: "Sarah Johnson",
    rating: 4.2,
    location: "Central Park Courts",
    distance: "0.5 miles",
    playingStyle: "Aggressive Baseline",
    availability: "Available today",
    profileImage: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Mike Chen", 
    rating: 3.8,
    location: "Riverside Tennis Club",
    distance: "1.2 miles",
    playingStyle: "All-Court Player",
    availability: "Available tomorrow",
    profileImage: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Emma Davis",
    rating: 4.5,
    location: "Downtown Courts",
    distance: "2.1 miles", 
    playingStyle: "Serve & Volley",
    availability: "Weekends only",
    profileImage: "/placeholder.svg"
  }
]

export default function FindPlayers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingRange, setRatingRange] = useState([3.0, 5.0])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [playingStyle, setPlayingStyle] = useState("")

  const filteredPlayers = mockPlayers.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    player.rating >= ratingRange[0] && 
    player.rating <= ratingRange[1]
  )

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Find Players</h1>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search players by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating Range</label>
              <div className="px-3">
                <Slider
                  value={ratingRange}
                  onValueChange={setRatingRange}
                  max={7}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{ratingRange[0].toFixed(1)}</span>
                  <span>{ratingRange[1].toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <LocationAutocomplete
                value={selectedLocation}
                onChange={(location) => setSelectedLocation(location)}
                placeholder="Search courts or areas..."
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Playing Style</label>
              <Select value={playingStyle} onValueChange={setPlayingStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Any style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="serve-volley">Serve & Volley</SelectItem>
                  <SelectItem value="all-court">All-Court</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={player.profileImage}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{player.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{player.location}</span>
                <Badge variant="secondary" className="text-xs">
                  {player.distance}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{player.availability}</span>
              </div>

              <Badge variant="outline" className="text-xs">
                {player.playingStyle}
              </Badge>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm">
                  Challenge
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
