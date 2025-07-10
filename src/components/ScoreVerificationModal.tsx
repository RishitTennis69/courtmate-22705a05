
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ScoreVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: {
    id: string;
    player1_score: string;
    player2_score: string;
    duration_minutes: number;
    submitted_by_id: string;
  };
  opponentName: string;
}

const ScoreVerificationModal = ({ isOpen, onClose, matchResult, opponentName }: ScoreVerificationModalProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleVerify = async (status: 'verified' | 'disputed') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_results')
        .update({
          status,
          verified_by_id: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', matchResult.id);

      if (error) throw error;

      // Create notification for the submitter
      await supabase
        .from('push_notifications')
        .insert({
          user_id: matchResult.submitted_by_id,
          title: status === 'verified' ? 'Match Score Verified' : 'Match Score Disputed',
          body: status === 'verified' 
            ? 'Your match score has been verified by your opponent!'
            : 'Your match score has been disputed. Please discuss with your opponent.',
          type: 'match_request',
          data: { match_result_id: matchResult.id, status }
        });

      toast({
        title: "Success",
        description: `Match score ${status === 'verified' ? 'verified' : 'disputed'} successfully`,
      });
      onClose();
    } catch (error) {
      console.error('Error updating match status:', error);
      toast({
        title: "Error",
        description: "Failed to update match status",
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
          <DialogTitle>Verify Match Score</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {opponentName} submitted the score:
            </p>
            <div className="text-2xl font-bold">
              {matchResult.player1_score} - {matchResult.player2_score}
            </div>
            {matchResult.duration_minutes && (
              <p className="text-sm text-muted-foreground mt-2">
                Duration: {matchResult.duration_minutes} minutes
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleVerify('verified')}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Score
            </Button>
            
            <Button
              onClick={() => handleVerify('disputed')}
              disabled={loading}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Dispute Score
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreVerificationModal;
