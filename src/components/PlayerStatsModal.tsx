import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponentId: string;
  opponentName: string;
}

interface PlayerStats {
  total_wins: number;
  total_losses: number;
  total_matches: number;
  win_percentage: number;
  longest_win_streak: number;
}

interface HeadToHeadStats {
  player1_wins: number;
  player2_wins: number;
  total_matches: number;
  avg_match_duration_minutes: number;
}

const PlayerStatsModal = ({ isOpen, onClose, opponentId, opponentName }: PlayerStatsModalProps) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [headToHeadStats, setHeadToHeadStats] = useState<HeadToHeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user && opponentId) {
      fetchStats();
    }
  }, [isOpen, user, opponentId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get overall player stats
      const { data: playerStatsData, error: playerStatsError } = await supabase
        .rpc('get_player_stats', { player_id: opponentId });

      if (playerStatsError) throw playerStatsError;

      // Get head-to-head stats
      const { data: headToHeadData, error: headToHeadError } = await supabase
        .rpc('get_head_to_head_stats', { 
          player1_id: user?.id, 
          player2_id: opponentId 
        });

      if (headToHeadError) throw headToHeadError;

      // Type the returned JSON data properly using unknown first
      setPlayerStats(playerStatsData as unknown as PlayerStats);
      setHeadToHeadStats(headToHeadData as unknown as HeadToHeadStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Player Statistics - {opponentName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Head-to-Head Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Head-to-Head Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              {headToHeadStats && headToHeadStats.total_matches > 0 ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {headToHeadStats.player1_wins}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {headToHeadStats.player2_wins}
                    </div>
                    <div className="text-sm text-muted-foreground">Their Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(headToHeadStats.avg_match_duration_minutes)}m
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Duration</div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No matches played yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Overall Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerStats && playerStats.total_matches > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {playerStats.total_wins}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {playerStats.total_losses}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {playerStats.win_percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {playerStats.longest_win_streak}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Streak</div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No match history available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Performance Badge */}
          <div className="flex justify-center">
            {playerStats && playerStats.total_matches > 0 && (
              <Badge variant="outline" className="text-lg px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                {playerStats.win_percentage >= 70 ? 'Strong Player' :
                 playerStats.win_percentage >= 50 ? 'Competitive Player' :
                 'Developing Player'}
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerStatsModal;
