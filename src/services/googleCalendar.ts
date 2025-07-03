
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
      const { data } = await supabase.functions.invoke('google-auth-url');
      if (data?.authUrl) {
        window.location.href = data.authUrl;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Google auth:', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    
    try {
      const { data } = await supabase.functions.invoke('get-calendar-token');
      this.accessToken = data?.access_token || null;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const { data } = await supabase.functions.invoke('get-calendar-events', {
        body: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      });
      return data?.events || [];
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      return [];
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
}

export const googleCalendarService = new GoogleCalendarService();
