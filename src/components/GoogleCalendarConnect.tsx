
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";
import { googleCalendarService } from "@/services/googleCalendar";
import { useToast } from "@/hooks/use-toast";

interface GoogleCalendarConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

const GoogleCalendarConnect = ({ onConnectionChange }: GoogleCalendarConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.initializeAuth();
      if (success) {
        toast({
          title: "Redirecting to Google",
          description: "You'll be redirected to connect your Google Calendar",
        });
      } else {
        throw new Error("Failed to initialize Google auth");
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Google Calendar Connected</p>
            <p className="text-sm text-green-600">We can now check your availability for matches</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Connect Google Calendar
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to automatically find the best times to play with other players
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Benefits of connecting your calendar:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Automatic availability matching with other players</li>
              <li>Smart scheduling suggestions</li>
              <li>Avoid double-booking conflicts</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Connect Google Calendar
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            This is optional and can be set up later in your profile settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarConnect;
