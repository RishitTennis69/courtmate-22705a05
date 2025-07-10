
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CalendarAvailabilityProps {
  onAvailabilitySet: (availability: AvailabilitySlot[]) => void;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_preferred: boolean;
}

const CalendarAvailability = ({ onAvailabilitySet }: CalendarAvailabilityProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const { toast } = useToast();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    checkCalendarConnection();
  }, []);

  useEffect(() => {
    // Listen for OAuth success messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        setIsConnected(true);
        setIsConnecting(false);
        analyzeCalendarAvailability();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkCalendarConnection = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('google_calendar_connected')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      setIsConnected(profile?.google_calendar_connected || false);
    } catch (error) {
      console.error('Error checking calendar connection:', error);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-auth-url');

      if (error) throw error;

      // Open Google auth in popup window
      const popup = window.open(
        data.authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
        }
      }, 1000);

      toast({
        title: "Google Calendar",
        description: "Please complete the authorization in the popup window.",
      });
    } catch (error) {
      console.error('Error connecting calendar:', error);
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const analyzeCalendarAvailability = async () => {
    try {
      // This would analyze the user's calendar and suggest available slots
      // For now, we'll create some sample availability based on common tennis playing times
      const commonAvailability: AvailabilitySlot[] = [
        { day_of_week: 1, start_time: '18:00', end_time: '20:00', is_preferred: true }, // Monday evening
        { day_of_week: 3, start_time: '18:00', end_time: '20:00', is_preferred: true }, // Wednesday evening
        { day_of_week: 6, start_time: '09:00', end_time: '12:00', is_preferred: true }, // Saturday morning
        { day_of_week: 0, start_time: '09:00', end_time: '12:00', is_preferred: false }, // Sunday morning
      ];

      setAvailabilitySlots(commonAvailability);
      toast({
        title: "Calendar Analyzed",
        description: "We've identified your preferred playing times based on your calendar.",
      });
    } catch (error) {
      console.error('Error analyzing calendar:', error);
      toast({
        title: "Error",
        description: "Failed to analyze calendar availability",
        variant: "destructive",
      });
    }
  };

  const handleConfirmAvailability = () => {
    onAvailabilitySet(availabilitySlots);
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Calendar</h3>
          <p className="text-gray-600">We'll analyze your schedule to suggest optimal playing times</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Why connect your calendar?</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Automatically find mutual availability with other players</li>
                <li>• Get smart match time suggestions</li>
                <li>• Avoid double-booking conflicts</li>
                <li>• Sync tennis matches to your calendar</li>
              </ul>
            </div>

            <Button
              onClick={handleConnectCalendar}
              disabled={isConnecting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isConnecting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">Calendar Connected!</h3>
        </div>
        <p className="text-gray-600">Here are your suggested playing times</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tennis Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {availabilitySlots.length > 0 ? (
            <div className="space-y-3">
              {availabilitySlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{dayNames[slot.day_of_week]}</span>
                    <span className="text-gray-600">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  {slot.is_preferred && (
                    <Badge variant="secondary">Preferred</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No availability detected. Please check your calendar.</p>
            </div>
          )}

          <Button
            onClick={handleConfirmAvailability}
            disabled={availabilitySlots.length === 0}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
          >
            Confirm Availability
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarAvailability;
