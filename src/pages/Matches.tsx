import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, MessageCircle, Trophy, CheckCircle, X, Shield, BarChart3, FileText, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MatchRatingModal from "@/components/MatchRatingModal";
import SafetyShareModal from "@/components/SafetyShareModal";
import MatchScoreModal from "@/components/MatchScoreModal";
import ScoreVerificationModal from "@/components/ScoreVerificationModal";
import PlayerStatsModal from "@/components/PlayerStatsModal";
import CalendarSyncButton from "@/components/CalendarSyncButton";

interface MatchRequest {
  id: string;
  requester_id: string;
  requested_id: string;
  proposed_datetime: string;
  location: string;
  message: string;
  status: string;
  created_at: string;
  requester: {
    full_name: string;
    profile_image_url: string;
    current_rating: number;
  };
  requested: {
    full_name: string;
    profile_image_url: string;
    current_rating: number;
  };
  match_results?: {
    id: string;
    player1_score: string;
    player2_score: string;
    status: string;
    submitted_by_id: string;
    duration_minutes: number;
  }[];
}

const Matches = () => {
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    matchResultId: string;
    opponentName: string;
    opponentId: string;
  }>({
    isOpen: false,
    matchResultId: '',
    opponentName: '',
    opponentId: ''
  });
  const [safetyModal, setSafetyModal] = useState<{
    isOpen: boolean;
    matchRequestId: string;
    opponentName: string;
    location: string;
    scheduledTime: string;
  }>({
    isOpen: false,
    matchRequestId: '',
    opponentName: '',
    location: '',
    scheduledTime: ''
  });
  const [scoreModal, setScoreModal] = useState<{
    isOpen: boolean;
    matchResultId: string;
    matchRequestId: string;
    opponentName: string;
    opponentId: string;
  }>({
    isOpen: false,
    matchResultId: '',
    matchRequestId: '',
    opponentName: '',
    opponentId: ''
  });
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    matchResult: any;
    opponentName: string;
  }>({
    isOpen: false,
    matchResult: null,
    opponentName: ''
  });
  const [statsModal, setStatsModal] = useState<{
    isOpen: boolean;
    opponentId: string;
    opponentName: string;
  }>({
    isOpen: false,
    opponentId: '',
    opponentName: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMatchRequests();
    }
  }, [user]);

  const fetchMatchRequests = async () => {
    try {
      // First get the match requests
      const { data: matchData, error: matchError } = await supabase
        .from('match_requests')
        .select('*')
        .or(`requester_id.eq.${user?.id},requested_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (matchError) throw matchError;

      if (!matchData || matchData.length === 0) {
        setMatchRequests([]);
        return;
      }

      // Get unique user IDs to fetch their profiles
      const userIds = [...new Set([
        ...matchData.map(match => match.requester_id),
        ...matchData.map(match => match.requested_id)
      ])];

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, profile_image_url, current_rating')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Fetch match results for each match request
      const { data: matchResultsData, error: matchResultsError } = await supabase
        .from('match_results')
        .select('*')
        .in('match_request_id', matchData.map(m => m.id));

      if (matchResultsError) throw matchResultsError;

      // Combine the data
      const combinedMatches = matchData.map(match => {
        const requester = profilesData?.find(p => p.id === match.requester_id);
        const requested = profilesData?.find(p => p.id === match.requested_id);
        const matchResults = matchResultsData?.filter(mr => mr.match_request_id === match.id) || [];
        
        return {
          ...match,
          requester: requester || {
            full_name: 'Unknown Player',
            profile_image_url: '',
            current_rating: 3.0
          },
          requested: requested || {
            full_name: 'Unknown Player',
            profile_image_url: '',
            current_rating: 3.0
          },
          match_results: matchResults
        };
      });

      setMatchRequests(combinedMatches);
    } catch (error) {
      console.error('Error fetching match requests:', error);
      toast({
        title: "Error",
        description: "Failed to load match requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatchResponse = async (matchId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('match_requests')
        .update({ status })
        .eq('id', matchId);

      if (error) throw error;

      await fetchMatchRequests();
      toast({
        title: "Success",
        description: `Match ${status}`,
      });
    } catch (error) {
      console.error('Error updating match status:', error);
      toast({
        title: "Error",
        description: "Failed to update match status",
        variant: "destructive",
      });
    }
  };

  const completeMatch = async (matchId: string, opponentId: string, opponentName: string) => {
    try {
      const { data: matchResult, error } = await supabase
        .from('match_results')
        .insert({
          match_request_id: matchId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update match request status
      await supabase
        .from('match_requests')
        .update({ status: 'completed' })
        .eq('id', matchId);

      setScoreModal({
        isOpen: true,
        matchResultId: matchResult.id,
        matchRequestId: matchId,
        opponentName,
        opponentId
      });

      await fetchMatchRequests();
    } catch (error) {
      console.error('Error completing match:', error);
      toast({
        title: "Error",
        description: "Failed to complete match",
        variant: "destructive",
      });
    }
  };

  const handleSafetyShare = (match: MatchRequest) => {
    const isRequester = match.requester_id === user?.id;
    const opponent = isRequester ? match.requested : match.requester;
    
    setSafetyModal({
      isOpen: true,
      matchRequestId: match.id,
      opponentName: opponent.full_name,
      location: match.location || 'TBD',
      scheduledTime: match.proposed_datetime 
        ? new Date(match.proposed_datetime).toLocaleString()
        : 'TBD'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600 border-red-600">Declined</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderMatchCard = (match: MatchRequest) => {
    const isRequester = match.requester_id === user?.id;
    const opponent = isRequester ? match.requested : match.requester;
    const opponentId = isRequester ? match.requested_id : match.requester_id;
    const matchResult = match.match_results?.[0];
    const needsVerification = matchResult && matchResult.status === 'pending' && 
      matchResult.submitted_by_id !== user?.id;
    const hasUnratedMatch = matchResult && matchResult.status === 'verified';

    return (
      <Card key={match.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={opponent.profile_image_url} />
                <AvatarFallback>
                  {opponent.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{opponent.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Trophy className="h-4 w-4" />
                    <span>Rating: {opponent.current_rating}</span>
                  </div>
                </div>
                
                {match.proposed_datetime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(match.proposed_datetime).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 text-gray-500 ml-2" />
                    <span>{new Date(match.proposed_datetime).toLocaleTimeString()}</span>
                  </div>
                )}
                
                {match.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{match.location}</span>
                  </div>
                )}
                
                {match.message && (
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700">{match.message}</p>
                  </div>
                )}

                {matchResult && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Score: {matchResult.player1_score}-{matchResult.player2_score}</span>
                    <Badge variant={matchResult.status === 'verified' ? 'default' : 'secondary'}>
                      {matchResult.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(match.status)}
              
              {match.status === 'pending' && !isRequester && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMatchResponse(match.id, 'accepted')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMatchResponse(match.id, 'declined')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
              
              {match.status === 'accepted' && (
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatsModal({
                      isOpen: true,
                      opponentId,
                      opponentName: opponent.full_name
                    })}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View Stats
                  </Button>
                  <CalendarSyncButton
                    matchDate={match.proposed_datetime}
                    matchLocation={match.location}
                    opponentName={opponent.full_name}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSafetyShare(match)}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Share Safety Info
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => completeMatch(match.id, opponentId, opponent.full_name)}
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    Complete Match
                  </Button>
                </div>
              )}

              {needsVerification && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVerificationModal({
                    isOpen: true,
                    matchResult,
                    opponentName: opponent.full_name
                  })}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verify Score
                </Button>
              )}

              {hasUnratedMatch && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRatingModal({
                    isOpen: true,
                    matchResultId: matchResult.id,
                    opponentName: opponent.full_name,
                    opponentId
                  })}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate Match
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading matches...</div>;
  }

  const pendingMatches = matchRequests.filter(m => m.status === 'pending');
  const activeMatches = matchRequests.filter(m => m.status === 'accepted');
  const completedMatches = matchRequests.filter(m => m.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Center</h1>
        <p className="text-gray-600">Manage your tennis matches and requests</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedMatches.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No pending match requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingMatches.map(renderMatchCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4 mt-6">
          {activeMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No active matches</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeMatches.map(renderMatchCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No completed matches</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedMatches.map(renderMatchCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MatchRatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
        matchResultId={ratingModal.matchResultId}
        opponentName={ratingModal.opponentName}
        opponentId={ratingModal.opponentId}
      />

      <SafetyShareModal
        isOpen={safetyModal.isOpen}
        onClose={() => setSafetyModal(prev => ({ ...prev, isOpen: false }))}
        matchRequestId={safetyModal.matchRequestId}
        opponentName={safetyModal.opponentName}
        location={safetyModal.location}
        scheduledTime={safetyModal.scheduledTime}
      />

      <MatchScoreModal
        isOpen={scoreModal.isOpen}
        onClose={() => setScoreModal(prev => ({ ...prev, isOpen: false }))}
        matchResultId={scoreModal.matchResultId}
        matchRequestId={scoreModal.matchRequestId}
        opponentName={scoreModal.opponentName}
        opponentId={scoreModal.opponentId}
      />

      <ScoreVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal(prev => ({ ...prev, isOpen: false }))}
        matchResult={verificationModal.matchResult}
        opponentName={verificationModal.opponentName}
      />

      <PlayerStatsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal(prev => ({ ...prev, isOpen: false }))}
        opponentId={statsModal.opponentId}
        opponentName={statsModal.opponentName}
      />
    </div>
  );
};

export default Matches;
