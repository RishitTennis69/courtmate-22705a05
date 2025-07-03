
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2, CheckCircle } from "lucide-react";
import { googleCalendarService, AvailabilitySlot } from "@/services/googleCalendar";
import { googlePlacesService, PlaceResult } from "@/services/googlePlaces";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import LocationAutocomplete from "./LocationAutocomplete";

interface MutualAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponentId: string;
  opponentName: string;
  onMatchRequested: () => void;
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  aiRecommended?: boolean;
}

const MutualAvailabilityModal = ({ 
  isOpen, 
  onClose, 
  opponentId, 
  opponentName,
  onMatchRequested 
}: MutualAvailabilityModalProps) => {
  const [loading, setLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceResult[]>([]);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      findMutualAvailability();
      findNearbyCourts();
    }
  }, [isOpen, selectedDate, user]);

  const findMutualAvailability = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      // Get both users' calendar events
      const userEvents = await googleCalendarService.getCalendarEvents(startDate, endDate);
      
      // For demo purposes, we'll simulate opponent's events
      // In production, you'd need to get actual opponent calendar data
      const opponentEvents = await googleCalendarService.getCalendarEvents(startDate, endDate);
      
      // Find mutual availability
      const mutualSlots = await googleCalendarService.findMutualAvailability(
        userEvents,
        opponentEvents,
        [{ start: "09:00", end: "18:00" }], // Preferred times
        selectedDate
      );

      // Add AI recommendations for best times
      const slotsWithAI = mutualSlots.map(slot => ({
        ...slot,
        aiRecommended: isOptimalTime(slot.start)
      }));

      setAvailabilitySlots(slotsWithAI);
    } catch (error) {
      console.error('Error finding mutual availability:', error);
      toast({
        title: "Error",
        description: "Failed to find mutual availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findNearbyCourts = async () => {
    try {
      // Get user's location from profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('location')
        .eq('id', user?.id)
        .single();

      if (profile?.location) {
        // Search for tennis courts near user's location
        const courts = await googlePlacesService.searchTennisCourts(
          { lat: 40.7128, lng: -74.0060 }, // Default to NYC, should be user's actual location
          5000
        );
        setLocationSuggestions(courts);
      }
    } catch (error) {
      console.error('Error finding nearby courts:', error);
    }
  };

  const isOptimalTime = (time: Date): boolean => {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    
    // AI logic: Recommend weekend mornings or weekday evenings
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      return hour >= 9 && hour <= 11;
    } else { // Weekday
      return hour >= 17 && hour <= 19;
    }
  };

  const handleSendMatchRequest = async () => {
    if (!selectedSlot || !location) {
      toast({
        title: "Missing Information",
        description: "Please select a time slot and location",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('match_requests')
        .insert({
          requester_id: user?.id,
          requested_id: opponentId,
          proposed_datetime: selectedSlot.start.toISOString(),
          location,
          message: message || `Hi ${opponentName}, would you like to play tennis?`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Match Request Sent",
        description: `Your request has been sent to ${opponentName}`,
      });

      onMatchRequested();
      onClose();
    } catch (error) {
      console.error('Error sending match request:', error);
      toast({
        title: "Error",
        description: "Failed to send match request",
        variant: "destructive",
      });
    }
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const startTime = slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Match with {opponentName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mutual Availability */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Finding mutual availability...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availabilitySlots.filter(slot => slot.available).map((slot, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSlot === slot
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{formatTimeSlot(slot)}</span>
                          <div className="flex gap-2">
                            {slot.aiRecommended && (
                              <Badge variant="secondary" className="text-xs">
                                AI Recommended
                              </Badge>
                            )}
                            {selectedSlot === slot && (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {availabilitySlots.filter(slot => slot.available).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No mutual availability found for this date
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location and Message */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Court Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LocationAutocomplete
                  value={location}
                  onChange={(loc) => setLocation(loc)}
                  placeholder="Search for tennis courts..."
                />

                {locationSuggestions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nearby Courts</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {locationSuggestions.slice(0, 5).map((court) => (
                        <div
                          key={court.place_id}
                          className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => setLocation(court.formatted_address)}
                        >
                          <div className="font-medium text-sm">{court.name}</div>
                          <div className="text-xs text-gray-500">{court.formatted_address}</div>
                          {court.rating && (
                            <div className="text-xs text-yellow-600">★ {court.rating}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Hi ${opponentName}, would you like to play tennis?`}
                    className="w-full p-2 border rounded-md h-20 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSendMatchRequest}
              disabled={!selectedSlot || !location}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Send Match Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MutualAvailabilityModal;
