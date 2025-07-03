
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Zap, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SmartSuggestion {
  datetime: Date;
  confidence: number;
  reason: string;
  location?: string;
  opponentId: string;
  opponentName: string;
}

interface SmartSchedulingWidgetProps {
  onScheduleMatch: (suggestion: SmartSuggestion) => void;
}

const SmartSchedulingWidget = ({ onScheduleMatch }: SmartSchedulingWidgetProps) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      generateSmartSuggestions();
    }
  }, [user]);

  const generateSmartSuggestions = async () => {
    try {
      // Get user's availability and recent activity patterns
      const { data: availability } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', user?.id);

      // Get user's match history to understand preferences
      const { data: recentMatches } = await supabase
        .from('match_requests')
        .select(`
          *,
          requester:user_profiles!match_requests_requester_id_fkey(full_name),
          requested:user_profiles!match_requests_requested_id_fkey(full_name)
        `)
        .or(`requester_id.eq.${user?.id},requested_id.eq.${user?.id}`)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get potential opponents from recent players or recommendations
      const { data: recommendations } = await supabase
        .from('player_recommendations')
        .select(`
          *,
          recommended:user_profiles!player_recommendations_recommended_player_id_fkey(*)
        `)
        .eq('user_id', user?.id)
        .gt('expires_at', new Date().toISOString())
        .order('recommendation_score', { ascending: false })
        .limit(5);

      // Generate AI-powered suggestions
      const smartSuggestions = generateSuggestions(availability, recentMatches, recommendations);
      setSuggestions(smartSuggestions);
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (availability: any[], recentMatches: any[], recommendations: any[]): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    const now = new Date();

    // Algorithm: Combine availability patterns, weather, and opponent preferences
    recommendations?.forEach((rec) => {
      if (!rec.recommended) return;

      availability?.forEach((slot) => {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        
        // Find next occurrence of this day/time
        const nextSlotDate = getNextOccurrence(slot.day_of_week, slot.start_time);
        
        if (nextSlotDate > now && nextSlotDate <= nextWeek) {
          const confidence = calculateConfidence(slot, rec, recentMatches);
          
          suggestions.push({
            datetime: nextSlotDate,
            confidence,
            reason: generateReason(slot, rec, confidence),
            opponentId: rec.recommended_player_id,
            opponentName: rec.recommended.full_name
          });
        }
      });
    });

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  const getNextOccurrence = (dayOfWeek: number, timeString: string): Date => {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);
    
    // Find next occurrence of this day of week
    const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
    if (daysUntilTarget === 0 && nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setDate(nextDate.getDate() + daysUntilTarget);
    }
    
    return nextDate;
  };

  const calculateConfidence = (slot: any, recommendation: any, recentMatches: any[]): number => {
    let confidence = 0.5; // Base confidence
    
    // Boost for preferred time slots
    if (slot.is_preferred) confidence += 0.2;
    
    // Boost for high recommendation score
    if (recommendation.recommendation_score) {
      confidence += (recommendation.recommendation_score / 100) * 0.2;
    }
    
    // Boost for weekend morning or weekday evening (popular tennis times)
    const hour = parseInt(slot.start_time.split(':')[0]);
    const isWeekend = slot.day_of_week === 0 || slot.day_of_week === 6;
    
    if ((isWeekend && hour >= 9 && hour <= 11) || (!isWeekend && hour >= 17 && hour <= 19)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  };

  const generateReason = (slot: any, recommendation: any, confidence: number): string => {
    const reasons = [];
    
    if (slot.is_preferred) {
      reasons.push("your preferred time");
    }
    
    if (recommendation.recommendation_score > 80) {
      reasons.push("highly compatible player");
    }
    
    const hour = parseInt(slot.start_time.split(':')[0]);
    const isWeekend = slot.day_of_week === 0 || slot.day_of_week === 6;
    
    if ((isWeekend && hour >= 9 && hour <= 11)) {
      reasons.push("optimal weekend morning");
    } else if (!isWeekend && hour >= 17 && hour <= 19) {
      reasons.push("popular evening slot");
    }
    
    if (confidence > 0.8) {
      reasons.push("high success probability");
    }
    
    return reasons.length > 0 ? `Great match because of ${reasons.join(", ")}` : "Good scheduling opportunity";
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: "default" as const, text: "High Match" };
    if (confidence >= 0.6) return { variant: "secondary" as const, text: "Good Match" };
    return { variant: "outline" as const, text: "Fair Match" };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading suggestions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Scheduling Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No scheduling suggestions available. Complete your availability settings and connect your calendar for better suggestions.
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const { date, time } = formatDateTime(suggestion.datetime);
              const badge = getConfidenceBadge(suggestion.confidence);
              
              return (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-lg">{suggestion.opponentName}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{time}</span>
                      </div>
                    </div>
                    <Badge variant={badge.variant}>{badge.text}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>
                  
                  <Button
                    onClick={() => onScheduleMatch(suggestion)}
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Schedule This Match
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartSchedulingWidget;
