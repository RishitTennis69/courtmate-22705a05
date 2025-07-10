
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;

  async initializeAuth(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { scope: 'https://www.googleapis.com/auth/calendar' }
      });
      
      if (error) throw error;
      
      if (data?.authUrl) {
        // Open auth URL in a popup window
        const popup = window.open(
          data.authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Poll for popup completion
        return new Promise((resolve) => {
          const pollTimer = setInterval(() => {
            if (popup?.closed) {
              clearInterval(pollTimer);
              // Check if auth was successful
              this.checkAuthStatus().then(resolve);
            }
          }, 1000);
        });
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Google auth:', error);
      return false;
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('google_calendar_connected, google_calendar_token')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profile?.google_calendar_connected && profile?.google_calendar_token) {
        this.accessToken = profile.google_calendar_token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    
    const isAuthenticated = await this.checkAuthStatus();
    return isAuthenticated ? this.accessToken : null;
  }

  async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-calendar-events', {
        body: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      });

      if (error) throw error;
      return data?.events || [];
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      return [];
    }
  }

  async createCalendarEvent(eventData: {
    summary: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime: Date;
  }): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated with Google Calendar');
      }

      const { error } = await supabase.functions.invoke('create-calendar-event', {
        body: {
          eventData: {
            summary: eventData.summary,
            description: eventData.description,
            location: eventData.location,
            start: {
              dateTime: eventData.startTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: eventData.endTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          },
          accessToken: token
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return false;
    }
  }

  async findMutualAvailability(
    userEvents: CalendarEvent[],
    partnerEvents: CalendarEvent[],
    preferredTimes: { start: string; end: string }[],
    date: Date
  ): Promise<AvailabilitySlot[]> {
    const dayStart = new Date(date);
    dayStart.setHours(6, 0, 0, 0); // Start checking from 6 AM
    
    const dayEnd = new Date(date);
    dayEnd.setHours(22, 0, 0, 0); // End checking at 10 PM
    
    const slots: AvailabilitySlot[] = [];
    const slotDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    // Create all possible 2-hour slots
    for (let time = dayStart.getTime(); time <= dayEnd.getTime() - slotDuration; time += 30 * 60 * 1000) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + slotDuration);
      
      const isAvailable = this.isSlotAvailable(slotStart, slotEnd, [...userEvents, ...partnerEvents]);
      
      slots.push({
        start: slotStart,
        end: slotEnd,
        available: isAvailable
      });
    }
    
    return slots;
  }

  private isSlotAvailable(slotStart: Date, slotEnd: Date, events: CalendarEvent[]): boolean {
    return !events.some(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date || '');
      const eventEnd = new Date(event.end.dateTime || event.end.date || '');
      
      // Check if slot overlaps with any event
      return (slotStart < eventEnd && slotEnd > eventStart);
    });
  }

  async disconnectCalendar(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          google_calendar_connected: false,
          google_calendar_token: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      this.accessToken = null;
      return true;
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
