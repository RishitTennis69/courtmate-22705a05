
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Users, MessageCircle, Calendar, Sparkles, RefreshCw } from "lucide-react";
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

const EnhancedPlayerRecommendations = () => {
  const [recommendations, setRecommendations] = useState<PlayerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
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

      const playerIds = recommendationsData.map(rec => rec.recommended_player_id);
      const { data: playersData, error: playersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, age, location, current_rating, playing_style, profile_image_url')
        .in('id', playerIds);

      if (playersError) throw playersError;

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

  const generateNewRecommendations = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('ai-enhanced-recommendations', {
        body: { userId: user?.id }
      });

      if (error) throw error;

      await fetchRecommendations();
      toast({
        title: "Recommendations Updated",
        description: "AI has generated new personalized recommendations for you!",
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate new recommendations",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
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
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            No recommendations available yet. Generate personalized matches!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateNewRecommendations} disabled={refreshing} className="w-full">
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate AI Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
        </div>
        <Button 
          onClick={generateNewRecommendations} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                  <AvatarImage src={rec.player.profile_image_url} />
                  <AvatarFallback>
                    {rec.player.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <h3 className="text-xl font-semibold">{rec.player.full_name}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 mt-1">
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
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <Badge variant="secondary">
                      {rec.player.playing_style}
                    </Badge>
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {Math.round(rec.recommendation_score * 100)}% AI Match
                    </Badge>
                    {rec.factors_matched?.map(factor => (
                      <Badge key={factor} variant="outline" className="text-xs">
                        {factor.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.reasoning}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={() => sendMatchRequest(rec.recommended_player_id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Request Match
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      View Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedPlayerRecommendations;
