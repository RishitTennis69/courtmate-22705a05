
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
                Welcome back, {profile?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600">Manage your tennis matches and find new playing partners</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={signOut}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold">{stats.totalMatches}</p>
                </div>
                <Trophy className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{stats.currentRating}</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        {profile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">{profile.location || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Age</p>
                    <p className="text-sm text-gray-600">{profile.age || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Playing Style</p>
                    <Badge variant="secondary">{profile.playing_style || 'Not set'}</Badge>
                  </div>
                </div>
              </div>
              {profile.bio && (
                <div className="mt-4">
                  <p className="font-medium mb-2">About</p>
                  <p className="text-sm text-gray-600">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">
              <Users className="h-4 w-4 mr-2" />
              Player Recommendations
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Clock className="h-4 w-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="matches">
              <Trophy className="h-4 w-4 mr-2" />
              Recent Matches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <PlayerRecommendations />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityScheduler />
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Recent Match Activity</CardTitle>
                <CardDescription>
                  Your recent matches and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No recent matches found</p>
                  <Button onClick={() => window.location.href = '/matches'}>
                    View All Matches
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
