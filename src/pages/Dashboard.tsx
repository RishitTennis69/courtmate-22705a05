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
  MessageSquare,
  Users as UsersIcon,
  MessageSquare as MessagesIcon
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
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [myCircles, setMyCircles] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
      generateRecommendations();
      fetchDashboardMatches();
      fetchDashboardCircles();
      fetchRecentMessages();
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

  // Fetch upcoming and recent matches
  const fetchDashboardMatches = async () => {
    try {
      const { data: matchData, error: matchError } = await supabase
        .from('match_requests')
        .select('*')
        .or(`requester_id.eq.${user?.id},requested_id.eq.${user?.id}`)
        .order('proposed_datetime', { ascending: true });
      if (matchError) throw matchError;
      const now = new Date();
      setUpcomingMatches((matchData || []).filter(m => m.proposed_datetime && new Date(m.proposed_datetime) > now).slice(0, 3));
      setRecentMatches((matchData || []).filter(m => m.proposed_datetime && new Date(m.proposed_datetime) <= now).slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard matches:', error);
    }
  };

  // Fetch user's circles
  const fetchDashboardCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles")
        .select(`*, circle_members!inner(user_id)`) 
        .eq("circle_members.user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMyCircles((data || []).slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard circles:", error);
    }
  };

  // Fetch recent messages
  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecentMessages((data || []).slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent messages:', error);
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
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* Stylish Dashboard Header */}
      <div className="w-full py-10 px-4 md:px-0 flex flex-col items-center">
        <h1 className="font-bricolage text-4xl md:text-5xl font-bold text-black mb-2 drop-shadow-lg tracking-tight">Dashboard</h1>
        <p className="text-lg text-emerald-900/80 mb-4">Your tennis at a glance</p>
      </div>

      <div className="max-w-7xl mx-auto px-2 pb-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 w-full">
        {/* Featured Upcoming Matches Widget */}
        <div className="flex flex-col h-full">
          <div className="glass-card flex-1 h-full rounded-3xl shadow-2xl border border-emerald-200/60 backdrop-blur-lg bg-white/60 p-8 mb-8 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 opacity-10 text-emerald-400 text-[8rem] pointer-events-none select-none">
              <Calendar className="w-32 h-32" />
            </div>
            <CardHeader className="bg-transparent p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-2xl">
                <Calendar className="h-6 w-6 text-emerald-500" /> Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingMatches.length === 0 ? (
                <p className="text-gray-500">No upcoming matches.</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingMatches.map((match, idx) => (
                    <li key={match.id || idx} className="border-b border-emerald-200 pb-2 last:border-b-0">
                      <div className="font-semibold text-emerald-800">{match.location || "TBD"}</div>
                      <div className="text-sm text-emerald-700">{match.proposed_datetime ? new Date(match.proposed_datetime).toLocaleString() : "TBD"}</div>
                      <div className="text-sm text-emerald-600">Opponent: {user?.id === match.requester_id ? match.requested_id : match.requester_id}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </div>
        </div>

        {/* Staggered Grid for Other Widgets */}
        <div className="flex flex-col gap-10 h-full xl:col-span-2">
          {/* Recent Match History Widget */}
          <div className="glass-card flex-1 h-full rounded-3xl shadow-xl border border-emerald-200/40 backdrop-blur-lg bg-white/50 p-8 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-10 text-emerald-400 text-[6rem] pointer-events-none select-none">
              <Trophy className="w-24 h-24" />
            </div>
            <CardHeader className="bg-transparent p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl">
                <Trophy className="h-5 w-5 text-emerald-500" /> Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentMatches.length === 0 ? (
                <p className="text-gray-500">No recent matches.</p>
              ) : (
                <ul className="space-y-4">
                  {recentMatches.map((match, idx) => (
                    <li key={match.id || idx} className="border-b border-emerald-100 pb-2 last:border-b-0">
                      <div className="font-semibold text-emerald-800">{match.location || "TBD"}</div>
                      <div className="text-sm text-emerald-700">{match.proposed_datetime ? new Date(match.proposed_datetime).toLocaleString() : "TBD"}</div>
                      <div className="text-sm text-emerald-600">Opponent: {user?.id === match.requester_id ? match.requested_id : match.requester_id}</div>
                      <div className="text-xs text-emerald-400">Status: {match.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </div>

          {/* Messages Widget */}
          <div className="glass-card flex-1 h-full rounded-3xl shadow-xl border border-emerald-200/40 backdrop-blur-lg bg-white/50 p-6 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-10 text-emerald-400 text-[5rem] pointer-events-none select-none">
              <MessagesIcon className="w-20 h-20" />
            </div>
            <CardHeader className="bg-transparent p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl">
                <MessagesIcon className="h-5 w-5 text-emerald-500" /> Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentMessages.length === 0 ? (
                <p className="text-gray-500">No recent messages.</p>
              ) : (
                <ul className="space-y-4">
                  {recentMessages.map((msg, idx) => (
                    <li key={msg.id || idx} className="border-b border-emerald-100 pb-2 last:border-b-0">
                      <div className="font-semibold text-emerald-800">{msg.subject || "No Subject"}</div>
                      <div className="text-sm text-emerald-700">{msg.body?.slice(0, 60) || "No content"}</div>
                      <div className="text-xs text-emerald-400">{new Date(msg.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </div>

          {/* AI Recommendations Widget (borderless) */}
          <div className="flex-1 h-full p-8 relative overflow-visible">
            <div className="absolute -top-6 -right-6 opacity-10 text-emerald-400 text-[6rem] pointer-events-none select-none">
              <Star className="w-24 h-24" />
            </div>
            <CardHeader className="bg-transparent p-0 mb-4">
              {/* Removed the CardTitle with 'AI Recommendations' */}
            </CardHeader>
            <CardContent className="p-0">
              <EnhancedPlayerRecommendations />
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
