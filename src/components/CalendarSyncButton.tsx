
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CalendarSyncButtonProps {
  matchDate?: string;
  matchLocation?: string;
  opponentName?: string;
}

const CalendarSyncButton = ({ matchDate, matchLocation, opponentName }: CalendarSyncButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCalendarSync = async () => {
    if (!matchDate) {
      toast({
        title: "Error",
        description: "No match date available to sync",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user has Google Calendar connected
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('google_calendar_connected, google_calendar_token')
        .eq('id', user?.id)
        .single();

      if (!profile?.google_calendar_connected) {
        // Get Google Calendar auth URL
        const { data, error } = await supabase.functions.invoke('google-auth-url', {
          body: { scope: 'calendar' }
        });

        if (error) throw error;

        // Open Google auth in new window
        window.open(data.authUrl, '_blank');
        
        toast({
          title: "Google Calendar Setup",
          description: "Please complete the Google Calendar authorization in the new window.",
        });
        return;
      }

      // Create calendar event
      const eventData = {
        summary: `Tennis Match${opponentName ? ` vs ${opponentName}` : ''}`,
        description: `Tennis match${opponentName ? ` against ${opponentName}` : ''}${matchLocation ? ` at ${matchLocation}` : ''}`,
        start: {
          dateTime: new Date(matchDate).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(new Date(matchDate).getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: matchLocation || ''
      };

      const { error } = await supabase.functions.invoke('create-calendar-event', {
        body: { eventData, accessToken: profile.google_calendar_token }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match added to your Google Calendar!",
      });
    } catch (error) {
      console.error('Error syncing with calendar:', error);
      toast({
        title: "Error",
        description: "Failed to sync with Google Calendar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCalendarSync}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <Calendar className="h-4 w-4 mr-2" />
      {loading ? "Syncing..." : "Add to Calendar"}
      <ExternalLink className="h-3 w-3 ml-1" />
    </Button>
  );
};

export default CalendarSyncButton;
