
-- Create table for storing user availability/calendar preferences
CREATE TABLE public.user_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_preferred BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for match requests with scheduling
CREATE TABLE public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users NOT NULL,
  requested_id UUID REFERENCES auth.users NOT NULL,
  proposed_datetime TIMESTAMP WITH TIME ZONE,
  location TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for match results and ratings
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_request_id UUID REFERENCES public.match_requests NOT NULL,
  winner_id UUID REFERENCES auth.users,
  score TEXT, -- e.g., "6-4, 6-2"
  duration_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for player ratings after matches
CREATE TABLE public.player_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_result_id UUID REFERENCES public.match_results NOT NULL,
  rater_id UUID REFERENCES auth.users NOT NULL,
  rated_player_id UUID REFERENCES auth.users NOT NULL,
  skill_assessment TEXT NOT NULL CHECK (skill_assessment IN ('much_easier', 'easier', 'same_level', 'harder', 'much_harder')),
  sportsmanship_rating INTEGER CHECK (sportsmanship_rating >= 1 AND sportsmanship_rating <= 5),
  would_play_again BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_result_id, rater_id, rated_player_id)
);

-- Create table for AI-generated player recommendations
CREATE TABLE public.player_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  recommended_player_id UUID REFERENCES auth.users NOT NULL,
  recommendation_score DECIMAL(3,2) CHECK (recommendation_score >= 0 AND recommendation_score <= 1),
  reasoning TEXT,
  factors_matched TEXT[], -- Array of factors like 'location', 'age', 'skill_level', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(user_id, recommended_player_id)
);

-- Create updated user profiles table with more detailed info for AI matching
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  age INTEGER,
  location TEXT,
  preferred_location TEXT,
  current_rating DECIMAL(2,1) DEFAULT 3.0,
  playing_style TEXT CHECK (playing_style IN ('aggressive', 'defensive', 'serve-volley', 'all-court')),
  availability_notes TEXT,
  bio TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  google_calendar_connected BOOLEAN DEFAULT false,
  google_calendar_token TEXT, -- Encrypted token for calendar access
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for all new tables
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- User availability policies
CREATE POLICY "Users can view their own availability" ON public.user_availability FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own availability" ON public.user_availability FOR ALL USING (auth.uid() = user_id);

-- Match requests policies
CREATE POLICY "Users can view their match requests" ON public.match_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = requested_id);
CREATE POLICY "Users can create match requests" ON public.match_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their match requests" ON public.match_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = requested_id);

-- Match results policies
CREATE POLICY "Match participants can view results" ON public.match_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.match_requests mr 
    WHERE mr.id = match_request_id 
    AND (mr.requester_id = auth.uid() OR mr.requested_id = auth.uid())
  )
);
CREATE POLICY "Match participants can create results" ON public.match_results FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.match_requests mr 
    WHERE mr.id = match_request_id 
    AND (mr.requester_id = auth.uid() OR mr.requested_id = auth.uid())
  )
);

-- Player ratings policies
CREATE POLICY "Users can view ratings they gave or received" ON public.player_ratings FOR SELECT USING (auth.uid() = rater_id OR auth.uid() = rated_player_id);
CREATE POLICY "Users can create ratings for matches they played" ON public.player_ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Player recommendations policies
CREATE POLICY "Users can view their own recommendations" ON public.player_recommendations FOR SELECT USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view all public profiles" ON public.user_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user rating based on match feedback
CREATE OR REPLACE FUNCTION public.update_player_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  rating_adjustment DECIMAL(2,1);
  current_rating DECIMAL(2,1);
BEGIN
  -- Get current rating of the rated player
  SELECT up.current_rating INTO current_rating
  FROM public.user_profiles up
  WHERE up.id = NEW.rated_player_id;

  -- Calculate rating adjustment based on skill assessment
  CASE NEW.skill_assessment
    WHEN 'much_easier' THEN rating_adjustment := -0.2;
    WHEN 'easier' THEN rating_adjustment := -0.1;
    WHEN 'same_level' THEN rating_adjustment := 0.0;
    WHEN 'harder' THEN rating_adjustment := 0.1;
    WHEN 'much_harder' THEN rating_adjustment := 0.2;
    ELSE rating_adjustment := 0.0;
  END CASE;

  -- Update the player's rating (keep within 1.0-5.0 range)
  UPDATE public.user_profiles
  SET 
    current_rating = GREATEST(1.0, LEAST(5.0, current_rating + rating_adjustment)),
    updated_at = now()
  WHERE id = NEW.rated_player_id;

  RETURN NEW;
END;
$$;

-- Create trigger to update ratings
CREATE TRIGGER on_player_rating_created
  AFTER INSERT ON public.player_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_player_rating();
