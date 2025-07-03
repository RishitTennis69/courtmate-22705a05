
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface UTRConverterProps {
  onConversionComplete: (ntrpRating: number) => void;
}

const UTRConverter = ({ onConversionComplete }: UTRConverterProps) => {
  const [utrRating, setUtrRating] = useState("");
  const [error, setError] = useState("");

  const convertUTRToNTRP = (utr: number): number => {
    // UTR to NTRP conversion formula based on tennis industry standards
    if (utr >= 13) return 5.0;
    if (utr >= 12) return 4.5;
    if (utr >= 11) return 4.0;
    if (utr >= 9) return 3.5;
    if (utr >= 7) return 3.0;
    if (utr >= 5) return 2.5;
    if (utr >= 3) return 2.0;
    if (utr >= 1) return 1.5;
    return 1.0;
  };

  const handleConvert = () => {
    const utr = parseFloat(utrRating);
    
    if (isNaN(utr) || utr < 1 || utr > 16.5) {
      setError("Please enter a valid UTR rating between 1.00 and 16.50");
      return;
    }

    const ntrp = convertUTRToNTRP(utr);
    onConversionComplete(ntrp);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">UTR to NTRP Conversion</h3>
        <p className="text-gray-600">Enter your current UTR rating for automatic NTRP conversion</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          UTR (Universal Tennis Rating) ranges from 1.00 to 16.50. We'll convert this to the equivalent NTRP rating.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Your UTR Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="utr-input">UTR Rating (1.00 - 16.50)</Label>
            <Input
              id="utr-input"
              type="number"
              step="0.01"
              min="1"
              max="16.5"
              placeholder="e.g., 8.25"
              value={utrRating}
              onChange={(e) => {
                setUtrRating(e.target.value);
                setError("");
              }}
              className="mt-2"
            />
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">UTR to NTRP Reference:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>UTR 13+ → NTRP 5.0</div>
              <div>UTR 12+ → NTRP 4.5</div>
              <div>UTR 11+ → NTRP 4.0</div>
              <div>UTR 9+ → NTRP 3.5</div>
              <div>UTR 7+ → NTRP 3.0</div>
              <div>UTR 5+ → NTRP 2.5</div>
              <div>UTR 3+ → NTRP 2.0</div>
              <div>UTR 1+ → NTRP 1.5</div>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!utrRating}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Convert to NTRP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UTRConverter;
