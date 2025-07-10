
import { useState, useEffect } from "react"
import { Search, Filter, MapPin, Calendar, Star, Users, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import LocationAutocomplete from "@/components/LocationAutocomplete"
import MutualAvailabilityModal from "@/components/MutualAvailabilityModal"
import SmartSchedulingWidget from "@/components/SmartSchedulingWidget"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface PlayerProfile {
  id: string;
  full_name: string;
  age: number | null;
  location: string | null;
  current_rating: number | null;
  playing_style: string | null;
  bio: string | null;
  profile_image_url: string | null;
  is_active: boolean | null;
}

export default function FindPlayers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingRange, setRatingRange] = useState([1.0, 7.0])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [playingStyle, setPlayingStyle] = useState("")
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [availabilityModal, setAvailabilityModal] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName: string;
  }>({
    isOpen: false,
    playerId: "",
    playerName: ""
  })

  useEffect(() => {
    if (user) {
      fetchPlayers();
    }
  }, [user, ratingRange, selectedLocation, playingStyle]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user?.id) // Exclude current user
        .eq('is_active', true)
        .gte('current_rating', ratingRange[0])
        .lte('current_rating', ratingRange[1]);

      // Filter by location if specified
      if (selectedLocation) {
        query = query.ilike('location', `%${selectedLocation}%`);
      }

      // Filter by playing style if specified
      if (playingStyle) {
        query = query.eq('playing_style', playingStyle);
      }

      const { data, error } = await query.order('current_rating', { ascending: false });

      if (error) throw error;

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to load players. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => 
    !searchTerm || player.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScheduleMatch = (suggestion: any) => {
    setAvailabilityModal({
      isOpen: true,
      playerId: suggestion.opponentId,
      playerName: suggestion.opponentName
    });
  };

  const handleMatchPlayer = (playerId: string, playerName: string) => {
    setAvailabilityModal({
      isOpen: true,
      playerId,
      playerName
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateDistance = (playerLocation: string | null) => {
    // This would normally calculate actual distance based on coordinates
    // For now, return a placeholder
    return playerLocation ? "~5 miles" : "Unknown";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Find Players</h1>
        <Button variant="outline" size="sm" onClick={fetchPlayers}>
          <Filter className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Smart Scheduling Widget */}
      <SmartSchedulingWidget onScheduleMatch={handleScheduleMatch} />

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
            <Button onClick={fetchPlayers}>
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
                  <SelectItem value="">Any style</SelectItem>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="serve-volley">Serve & Volley</SelectItem>
                  <SelectItem value="all-court">All-Court</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="defensive">Defensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Player Results */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {player.profile_image_url ? (
                    <img
                      src={player.profile_image_url}
                      alt={player.full_name || "Player"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {getInitials(player.full_name)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{player.full_name || "Unknown Player"}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{player.current_rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{player.location || "Location not set"}</span>
                  <Badge variant="secondary" className="text-xs">
                    {calculateDistance(player.location)}
                  </Badge>
                </div>
                
                {player.age && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Age {player.age}</span>
                  </div>
                )}

                {player.playing_style && (
                  <Badge variant="outline" className="text-xs">
                    {player.playing_style}
                  </Badge>
                )}

                {player.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">{player.bio}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleMatchPlayer(player.id, player.full_name || "Player")}
                  >
                    Schedule Match
                  </Button>
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPlayers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground mb-4">
              {players.length === 0 
                ? "No players have joined yet. Be the first to create your profile!" 
                : "Try adjusting your search criteria to find more players."
              }
            </p>
            {players.length === 0 && (
              <Button onClick={() => window.location.href = '/onboarding'}>
                Complete Your Profile
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mutual Availability Modal */}
      <MutualAvailabilityModal
        isOpen={availabilityModal.isOpen}
        onClose={() => setAvailabilityModal(prev => ({ ...prev, isOpen: false }))}
        opponentId={availabilityModal.playerId}
        opponentName={availabilityModal.playerName}
        onMatchRequested={() => {
          console.log('Match request sent successfully');
          toast({
            title: "Match Request Sent",
            description: `Your request has been sent to ${availabilityModal.playerName}`,
          });
        }}
      />
    </div>
  )
}
