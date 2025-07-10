import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle } from "lucide-react";

interface UTRConverterProps {
  onConversionComplete: (ntrpRating: number) => void;
}

const UTRConverter = ({ onConversionComplete }: UTRConverterProps) => {
  const [utrRating, setUtrRating] = useState("");
  const [convertedNtrp, setConvertedNtrp] = useState<number | null>(null);
  const [error, setError] = useState("");

  const convertUTRToNTRP = (utr: number): number => {
    // UTR to NTRP conversion formula accounting for progressive difficulty
    // UTR players are competitive by nature - minimum 2.5 NTRP
    
    // Clamp UTR to reasonable range
    if (utr < 1.0) return 2.5;
    if (utr >= 10.0) return 7.0;
    
    // Progressive conversion with linear interpolation within ranges
    if (utr <= 2.0) return 2.5 + ((utr - 1.0) * 0.5); // 2.5-3.0 NTRP
    if (utr <= 3.0) return 3.0 + ((utr - 2.0) * 0.5); // 3.0-3.5 NTRP
    if (utr <= 4.0) return 3.5 + ((utr - 3.0) * 0.5); // 3.5-4.0 NTRP
    if (utr <= 5.0) return 4.0 + ((utr - 4.0) * 0.5); // 4.0-4.5 NTRP
    if (utr <= 6.0) return 4.5 + ((utr - 5.0) * 0.5); // 4.5-5.0 NTRP
    if (utr <= 7.0) return 5.0 + ((utr - 6.0) * 0.5); // 5.0-5.5 NTRP
    if (utr <= 8.0) return 5.5 + ((utr - 7.0) * 0.5); // 5.5-6.0 NTRP
    if (utr <= 9.0) return 6.0 + ((utr - 8.0) * 0.5); // 6.0-6.5 NTRP
    if (utr <= 10.0) return 6.5 + ((utr - 9.0) * 0.5); // 6.5-7.0 NTRP
    
    return 7.0; // Cap at 7.0 for 10+ UTR
  };

  const handleConvert = () => {
    const utr = parseFloat(utrRating);
    
    if (isNaN(utr) || utr < 1 || utr > 16.5) {
      setError("Please enter a valid UTR rating between 1.00 and 16.50");
      return;
    }

    const ntrp = convertUTRToNTRP(utr);
    // Round to nearest 0.5 or 0.0
    const roundedNtrp = Math.round(ntrp * 2) / 2;
    setConvertedNtrp(roundedNtrp);
  };

  const handleConfirm = () => {
    if (convertedNtrp) {
      onConversionComplete(convertedNtrp);
    }
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
          UTR (Universal Tennis Rating) ranges from 1.00 to 16.50, with most competitive players between 1-10 UTR. 
          We'll convert this to the equivalent NTRP rating (2.5-7.0), accounting for UTR's progressive difficulty scale.
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
              placeholder="e.g., 6.25"
              value={utrRating}
              onChange={(e) => {
                setUtrRating(e.target.value);
                setError("");
                setConvertedNtrp(null);
              }}
              className="mt-2"
              disabled={convertedNtrp !== null}
            />
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>

          {convertedNtrp !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-800">Your NTRP Rating</h4>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700 mb-2">{convertedNtrp}</div>
                <p className="text-sm text-emerald-600 mb-4">
                  Based on your UTR rating of {utrRating}, your equivalent NTRP rating is {convertedNtrp}.
                </p>
                <Button 
                  onClick={handleConfirm}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm NTRP Rating
                </Button>
              </div>
            </div>
          )}

          {convertedNtrp === null && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">UTR to NTRP Reference (Progressive Scale):</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>UTR 1.0-2.0 → NTRP 2.5-3.0</div>
                  <div>UTR 2.0-3.0 → NTRP 3.0-3.5</div>
                  <div>UTR 3.0-4.0 → NTRP 3.5-4.0</div>
                  <div>UTR 4.0-5.0 → NTRP 4.0-4.5</div>
                  <div>UTR 5.0-6.0 → NTRP 4.5-5.0</div>
                  <div>UTR 6.0-7.0 → NTRP 5.0-5.5</div>
                  <div>UTR 7.0-8.0 → NTRP 5.5-6.0</div>
                  <div>UTR 8.0-9.0 → NTRP 6.0-6.5</div>
                  <div>UTR 9.0-10.0 → NTRP 6.5-7.0</div>
                  <div className="col-span-2 text-center font-medium">UTR 10+ → NTRP 7.0</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  *UTR difficulty increases progressively - higher UTR improvements represent exponentially greater skill development
                </p>
              </div>

              <Button
                onClick={handleConvert}
                disabled={!utrRating}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Convert to NTRP
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UTRConverter;
