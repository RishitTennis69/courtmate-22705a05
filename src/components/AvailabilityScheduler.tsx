
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_preferred: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AvailabilityScheduler = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', user?.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = async (dayOfWeek: number) => {
    try {
      const { data, error } = await supabase
        .from('user_availability')
        .insert({
          user_id: user?.id,
          day_of_week: dayOfWeek,
          start_time: '09:00',
          end_time: '17:00',
          is_preferred: true
        })
        .select()
        .single();

      if (error) throw error;

      setAvailability(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Time slot added",
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast({
        title: "Error",
        description: "Failed to add time slot",
        variant: "destructive",
      });
    }
  };

  const removeTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailability(prev => prev.filter(slot => slot.id !== id));
      toast({
        title: "Success",
        description: "Time slot removed",
      });
    } catch (error) {
      console.error('Error removing time slot:', error);
      toast({
        title: "Error",
        description: "Failed to remove time slot",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading availability...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Playing Availability
        </CardTitle>
        <CardDescription>
          Set your preferred times to play tennis throughout the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day, index) => {
            const daySlots = availability.filter(slot => slot.day_of_week === index);
            
            return (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{day}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addTimeSlot(index)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Time
                  </Button>
                </div>
                
                {daySlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No availability set</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {slot.start_time} - {slot.end_time}
                          </span>
                          {slot.is_preferred && (
                            <Badge variant="secondary" className="text-xs">
                              Preferred
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTimeSlot(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityScheduler;
