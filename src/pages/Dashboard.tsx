import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  Trophy, 
  Settings, 
  MapPin, 
  Star,
  TrendingUp,
  Clock,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AvailabilityScheduler from "@/components/AvailabilityScheduler";
import PlayerRecommendations from "@/components/PlayerRecommendations";
import MobileOptimizedDashboard from "@/components/MobileOptimizedDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import EnhancedPlayerRecommendations from "@/components/EnhancedPlayerRecommendations";

interface UserProfile {
  full_name: string;
  age: number;
  location: string;
  current_rating: number;
  playing_style: string;
  bio: string;
}

interface DashboardStats {
  totalMatches: number;
  pendingRequests: number;
  winRate: number;
  currentRating: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    pendingRequests: 0,
    winRate: 0,
    currentRating: 3.0
  });
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
      generateRecommendations();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get match requests count
      const { data: requests, error: requestsError } = await supabase
        .from('match_requests')
        .select('id, status')
        .or(`requester_id.eq.${user?.id},requested_id.eq.${user?.id}`);

      if (requestsError) throw requestsError;

      // Get match results for win rate
      const { data: results, error: resultsError } = await supabase
        .from('match_results')
        .select('winner_id, match_requests!inner(requester_id, requested_id)')
        .or(`match_requests.requester_id.eq.${user?.id},match_requests.requested_id.eq.${user?.id}`);

      if (resultsError) throw resultsError;

      const totalMatches = results?.length || 0;
      const wins = results?.filter(r => r.winner_id === user?.id).length || 0;
      const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
      const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;

      setStats({
        totalMatches,
        pendingRequests,
        winRate,
        currentRating: profile?.current_rating || 3.0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      const { error } = await supabase.functions.invoke('generate-recommendations', {
        body: { userId: user?.id }
      });

      if (error) {
        console.error('Error generating recommendations:', error);
      }
    } catch (error) {
      console.error('Error calling recommendations function:', error);
    }
  };

  if (isMobile) {
    return <MobileOptimizedDashboard />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back!
              </h1>
              <p className="text-gray-600">Manage your tennis matches and find new playing partners</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Use Enhanced Player Recommendations */}
        <EnhancedPlayerRecommendations />
      </div>
    </div>
  );
};

export default Dashboard;
