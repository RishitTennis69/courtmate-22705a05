
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MatchScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResultId: string;
  matchRequestId: string;
  opponentName: string;
  opponentId: string;
}

const MatchScoreModal = ({ isOpen, onClose, matchResultId, matchRequestId, opponentName, opponentId }: MatchScoreModalProps) => {
  const [player1Score, setPlayer1Score] = useState("");
  const [player2Score, setPlayer2Score] = useState("");
  const [matchDuration, setMatchDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!player1Score || !player2Score) {
      toast({
        title: "Error",
        description: "Please enter scores for both players",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Determine winner based on scores
      const p1Sets = parseInt(player1Score);
      const p2Sets = parseInt(player2Score);
      let winnerId = null;
      
      if (p1Sets > p2Sets) {
        // Player 1 wins - determine if current user is player 1 or 2
        const { data: matchRequest } = await supabase
          .from('match_requests')
          .select('requester_id, requested_id')
          .eq('id', matchRequestId)
          .single();
        
        winnerId = matchRequest?.requester_id === user?.id ? user.id : opponentId;
      } else if (p2Sets > p1Sets) {
        // Player 2 wins
        const { data: matchRequest } = await supabase
          .from('match_requests')
          .select('requester_id, requested_id')
          .eq('id', matchRequestId)
          .single();
        
        winnerId = matchRequest?.requested_id === user?.id ? user.id : opponentId;
      }

      const { error } = await supabase
        .from('match_results')
        .update({
          player1_score: player1Score,
          player2_score: player2Score,
          duration_minutes: matchDuration ? parseInt(matchDuration) : null,
          winner_id: winnerId,
          status: 'pending',
          submitted_by_id: user?.id,
          submitted_at: new Date().toISOString()
        })
        .eq('id', matchResultId);

      if (error) throw error;

      // Create notification for opponent to verify
      await supabase
        .from('push_notifications')
        .insert({
          user_id: opponentId,
          title: 'Match Score Submitted',
          body: `Please verify the match score submitted by your opponent: ${player1Score}-${player2Score}`,
          type: 'match_request',
          data: { match_result_id: matchResultId, action: 'verify_score' }
        });

      toast({
        title: "Success",
        description: "Match score submitted! Waiting for opponent verification.",
      });
      onClose();
    } catch (error) {
      console.error('Error submitting match score:', error);
      toast({
        title: "Error",
        description: "Failed to submit match score",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Match Score</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="player1Score">Your Score</Label>
              <Input
                id="player1Score"
                type="number"
                placeholder="Sets won"
                value={player1Score}
                onChange={(e) => setPlayer1Score(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="player2Score">{opponentName}'s Score</Label>
              <Input
                id="player2Score"
                type="number"
                placeholder="Sets won"
                value={player2Score}
                onChange={(e) => setPlayer2Score(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Match Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 90"
              value={matchDuration}
              onChange={(e) => setMatchDuration(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about the match..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Score"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchScoreModal;
