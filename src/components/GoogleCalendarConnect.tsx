
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import { googleCalendarService } from "@/services/googleCalendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GoogleCalendarConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

const GoogleCalendarConnect = ({ onConnectionChange }: GoogleCalendarConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    try {
      setIsChecking(true);
      const connected = await googleCalendarService.checkAuthStatus();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking connection status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.initializeAuth();
      if (success) {
        setIsConnected(true);
        onConnectionChange?.(true);
        toast({
          title: "Calendar Connected",
          description: "Your Google Calendar has been successfully connected!",
        });
      } else {
        throw new Error("Failed to connect to Google Calendar");
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsConnecting(true);
      const success = await googleCalendarService.disconnectCalendar();
      if (success) {
        setIsConnected(false);
        onConnectionChange?.(false);
        toast({
          title: "Calendar Disconnected",
          description: "Your Google Calendar has been disconnected.",
        });
      } else {
        throw new Error("Failed to disconnect calendar");
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking calendar connection...</span>
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Google Calendar Connected</p>
                <p className="text-sm text-green-600">We can now check your availability for matches</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-2">Benefits of connecting your calendar:</p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Automatic availability matching with other players</li>
                  <li>• Smart scheduling suggestions based on your free time</li>
                  <li>• Avoid double-booking conflicts</li>
                  <li>• Sync tennis matches directly to your calendar</li>
                </ul>
              </div>
            </div>
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
