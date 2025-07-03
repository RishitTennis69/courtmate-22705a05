
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trophy, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MatchRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResultId: string;
  opponentName: string;
  opponentId: string;
}

const MatchRatingModal = ({ isOpen, onClose, matchResultId, opponentName, opponentId }: MatchRatingModalProps) => {
  const [skillAssessment, setSkillAssessment] = useState<string>("");
  const [sportsmanshipRating, setSportsmanshipRating] = useState<number>(5);
  const [wouldPlayAgain, setWouldPlayAgain] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const skillOptions = [
    { value: 'much_easier', label: 'Much Easier', desc: 'Significantly below my level', icon: '👇' },
    { value: 'easier', label: 'Easier', desc: 'Somewhat below my level', icon: '📉' },
    { value: 'same_level', label: 'Same Level', desc: 'Perfectly matched skill', icon: '⚖️' },
    { value: 'harder', label: 'Harder', desc: 'Somewhat above my level', icon: '📈' },
    { value: 'much_harder', label: 'Much Harder', desc: 'Significantly above my level', icon: '👆' }
  ];

  const handleSubmit = async () => {
    if (!skillAssessment) {
      toast({
        title: "Error",
        description: "Please select a skill assessment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('player_ratings')
        .insert({
          match_result_id: matchResultId,
          rater_id: user?.id,
          rated_player_id: opponentId,
          skill_assessment: skillAssessment,
          sportsmanship_rating: sportsmanshipRating,
          would_play_again: wouldPlayAgain,
          notes: notes.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match rating submitted successfully!",
      });
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rate Your Match with {opponentName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Skill Assessment */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              How was their skill level compared to yours?
            </Label>
            <RadioGroup value={skillAssessment} onValueChange={setSkillAssessment}>
              <div className="space-y-2">
                {skillOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Sportsmanship Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Sportsmanship Rating
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSportsmanshipRating(rating)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= sportsmanshipRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Rate their sportsmanship and behavior during the match
            </p>
          </div>

          {/* Would Play Again */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Would you play with them again?
            </Label>
            <div className="flex gap-4">
              <Card 
                className={`cursor-pointer transition-colors ${wouldPlayAgain ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'}`}
                onClick={() => setWouldPlayAgain(true)}
              >
                <CardContent className="p-4 text-center">
                  <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-medium">Yes</p>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-colors ${!wouldPlayAgain ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'}`}
                onClick={() => setWouldPlayAgain(false)}
              >
                <CardContent className="p-4 text-center">
                  <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="font-medium">No</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Share any additional thoughts about the match or your opponent..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchRatingModal;
