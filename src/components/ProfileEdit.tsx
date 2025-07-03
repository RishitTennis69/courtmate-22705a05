
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Save } from "lucide-react";
import LocationAutocomplete from "./LocationAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  full_name: string | null;
  age: number | null;
  location: string | null;
  current_rating: number | null;
  playing_style: string | null;
  bio: string | null;
  availability_notes: string | null;
}

const ProfileEdit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    age: null,
    location: "",
    current_rating: 3.0,
    playing_style: "",
    bio: "",
    availability_notes: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          age: data.age || null,
          location: data.location || "",
          current_rating: data.current_rating || 3.0,
          playing_style: data.playing_style || "",
          bio: data.bio || "",
          availability_notes: data.availability_notes || ""
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          age: profile.age,
          location: profile.location,
          current_rating: profile.current_rating,
          playing_style: profile.playing_style,
          bio: profile.bio,
          availability_notes: profile.availability_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your personal information and tennis preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="13"
              max="100"
              value={profile.age || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
              placeholder="Enter your age"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <LocationAutocomplete
            value={profile.location || ""}
            onChange={(location) => setProfile(prev => ({ ...prev, location }))}
            placeholder="Enter your city or area"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rating">NTRP Rating</Label>
            <Select
              value={profile.current_rating?.toString() || "3.0"}
              onValueChange={(value) => setProfile(prev => ({ ...prev, current_rating: parseFloat(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">1.0 - Beginner</SelectItem>
                <SelectItem value="1.5">1.5 - Beginner</SelectItem>
                <SelectItem value="2.0">2.0 - High Beginner</SelectItem>
                <SelectItem value="2.5">2.5 - High Beginner</SelectItem>
                <SelectItem value="3.0">3.0 - Intermediate</SelectItem>
                <SelectItem value="3.5">3.5 - Intermediate</SelectItem>
                <SelectItem value="4.0">4.0 - Advanced</SelectItem>
                <SelectItem value="4.5">4.5 - Advanced</SelectItem>
                <SelectItem value="5.0">5.0 - Expert</SelectItem>
                <SelectItem value="5.5">5.5 - Expert</SelectItem>
                <SelectItem value="6.0">6.0 - Professional</SelectItem>
                <SelectItem value="6.5">6.5 - Professional</SelectItem>
                <SelectItem value="7.0">7.0 - World Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playingStyle">Playing Style</Label>
            <Select
              value={profile.playing_style || ""}
              onValueChange={(value) => setProfile(prev => ({ ...prev, playing_style: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baseline">Baseline</SelectItem>
                <SelectItem value="serve-volley">Serve & Volley</SelectItem>
                <SelectItem value="all-court">All-Court</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
                <SelectItem value="defensive">Defensive</SelectItem>
                <SelectItem value="counter-puncher">Counter-Puncher</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio || ""}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell other players about yourself, your tennis experience, and what you're looking for..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Availability Notes</Label>
          <Textarea
            id="availability"
            value={profile.availability_notes || ""}
            onChange={(e) => setProfile(prev => ({ ...prev, availability_notes: e.target.value }))}
            placeholder="When are you typically available to play? (e.g., weekday evenings, weekend mornings)"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEdit;
