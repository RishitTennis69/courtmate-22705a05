
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  MessageSquare,
  TrendingUp,
  Star,
  Users,
  Calendar,
  MapPin,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EnhancedPlayerRecommendations from "./EnhancedPlayerRecommendations";

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

const MobileOptimizedDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    pendingRequests: 0,
    winRate: 0,
    currentRating: 3.0
  });
  const [loading, setLoading] = useState(true);

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
      const { data: requests, error: requestsError } = await supabase
        .from('match_requests')
        .select('id, status')
        .or(`requester_id.eq.${user?.id},requested_id.eq.${user?.id}`);

      if (requestsError) throw requestsError;

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
      await supabase.functions.invoke('ai-enhanced-recommendations', {
        body: { userId: user?.id }
      });
    } catch (error) {
      console.error('Error calling recommendations function:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section - Mobile Optimized */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Player'}!
          </h1>
          <p className="text-gray-600 text-sm md:text-base">Ready to find your perfect tennis match?</p>
        </div>

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                <p className="text-lg md:text-2xl font-bold">{stats.totalMatches}</p>
                <p className="text-xs md:text-sm opacity-90">Matches</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                <p className="text-lg md:text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs md:text-sm opacity-90">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                <p className="text-lg md:text-2xl font-bold">{stats.winRate.toFixed(0)}%</p>
                <p className="text-xs md:text-sm opacity-90">Win Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center">
                <Star className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                <p className="text-lg md:text-2xl font-bold">{stats.currentRating}</p>
                <p className="text-xs md:text-sm opacity-90">NTRP</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary - Mobile Optimized */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">Location</p>
                    <p className="text-sm text-gray-600 truncate">{profile.location || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Age</p>
                    <p className="text-sm text-gray-600">{profile.age || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Playing Style</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {profile.playing_style || 'Not set'}
                    </Badge>
                  </div>
                </div>
              </div>
              {profile.bio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium mb-2 text-sm">About</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations Section */}
        <div>
          <EnhancedPlayerRecommendations />
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizedDashboard;
