import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
}

interface UserProfile {
  age: number | null;
  location: string | null;
  playing_style: string | null;
  current_rating: number | null;
}

const ProfileCompletionCheck = ({ children }: ProfileCompletionCheckProps) => {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      checkProfileCompletion();
    }
  }, [user, authLoading]);

  const checkProfileCompletion = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('age, location, playing_style, current_rating')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setIsProfileComplete(false);
      } else {
        // Check if all required fields are completed (removed full_name requirement)
        const isComplete = !!(
          profile?.age &&
          profile?.location &&
          profile?.current_rating &&
          profile?.current_rating > 0
        );

        setIsProfileComplete(isComplete);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setIsProfileComplete(false);
    } finally {
      setProfileLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // If profile is not complete, redirect to onboarding
  if (!isProfileComplete) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

export default ProfileCompletionCheck;

