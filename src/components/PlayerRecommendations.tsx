
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Users, MessageCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PlayerRecommendation {
  id: string;
  recommended_player_id: string;
  recommendation_score: number;
  reasoning: string;
  factors_matched: string[];
  player: {
    full_name: string;
    age: number;
    location: string;
    current_rating: number;
    playing_style: string;
    profile_image_url: string;
  };
}

const PlayerRecommendations = () => {
  const [recommendations, setRecommendations] = useState<PlayerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      // First get the recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('player_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .gt('expires_at', new Date().toISOString())
        .order('recommendation_score', { ascending: false });

      if (recommendationsError) throw recommendationsError;

      if (!recommendationsData || recommendationsData.length === 0) {
        setRecommendations([]);
        return;
      }

      // Get the player IDs to fetch their profiles
      const playerIds = recommendationsData.map(rec => rec.recommended_player_id);

      // Fetch user profiles for the recommended players
      const { data: playersData, error: playersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, age, location, current_rating, playing_style, profile_image_url')
        .in('id', playerIds);

      if (playersError) throw playersError;

      // Combine the data
      const combinedRecommendations = recommendationsData.map(rec => {
        const player = playersData?.find(p => p.id === rec.recommended_player_id);
        return {
          ...rec,
          player: player || {
            full_name: 'Unknown Player',
            age: 0,
            location: 'Unknown',
            current_rating: 3.0,
            playing_style: 'all-court',
            profile_image_url: ''
          }
        };
      });

      setRecommendations(combinedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMatchRequest = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('match_requests')
        .insert({
          requester_id: user?.id,
          requested_id: playerId,
          message: "Hi! I'd love to play a match with you. Let me know if you're interested!",
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match request sent!",
      });
    } catch (error) {
      console.error('Error sending match request:', error);
      toast({
        title: "Error",
        description: "Failed to send match request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Player Recommendations
          </CardTitle>
          <CardDescription>
            No recommendations available yet. Complete your profile to get personalized matches!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Recommended Players</h2>
      </div>
      
      {recommendations.map((rec) => (
        <Card key={rec.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={rec.player.profile_image_url} />
                  <AvatarFallback>
                    {rec.player.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold">{rec.player.full_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {rec.player.location}
                      </span>
                      <span>Age {rec.player.age}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{rec.player.current_rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {rec.player.playing_style}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(rec.recommendation_score * 100)}% Match
                    </Badge>
                    {rec.factors_matched?.map(factor => (
                      <Badge key={factor} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-700">{rec.reasoning}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => sendMatchRequest(rec.recommended_player_id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Request Match
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlayerRecommendations;
