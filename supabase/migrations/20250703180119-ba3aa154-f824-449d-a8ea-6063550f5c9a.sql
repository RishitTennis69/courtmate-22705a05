
-- Add score tracking and verification to match_results
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS player1_score TEXT;
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS player2_score TEXT;
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS submitted_by_id UUID REFERENCES auth.users;
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS verified_by_id UUID REFERENCES auth.users;
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed'));
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create table for tracking consecutive skill assessments for NTRP adjustments
CREATE TABLE public.skill_assessment_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES auth.users NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('easier', 'harder')),
  consecutive_count INTEGER DEFAULT 1,
  last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, assessment_type)
);

-- Create table for NTRP rating history
CREATE TABLE public.rating_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES auth.users NOT NULL,
  old_rating DECIMAL(2,1) NOT NULL,
  new_rating DECIMAL(2,1) NOT NULL,
  reason TEXT NOT NULL, -- 'skill_assessment', 'manual_adjustment', etc.
  triggered_by_rating_id UUID REFERENCES public.player_ratings,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.skill_assessment_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;

-- Policies for skill assessment streaks
CREATE POLICY "Players can view their streaks" ON public.skill_assessment_streaks FOR SELECT USING (auth.uid() = player_id);

-- Policies for rating history
CREATE POLICY "Players can view their rating history" ON public.rating_history FOR SELECT USING (auth.uid() = player_id);

-- Update the match results policies to allow verification
CREATE POLICY "Match participants can verify results" ON public.match_results FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.match_requests mr 
    WHERE mr.id = match_request_id 
    AND (mr.requester_id = auth.uid() OR mr.requested_id = auth.uid())
  )
);

-- Function to get head-to-head stats between two players
CREATE OR REPLACE FUNCTION public.get_head_to_head_stats(player1_id UUID, player2_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  player1_wins INTEGER := 0;
  player2_wins INTEGER := 0;
  total_matches INTEGER := 0;
  avg_match_duration DECIMAL := 0;
  result JSON;
BEGIN
  -- Count wins for each player
  SELECT 
    COUNT(*) FILTER (WHERE mr.winner_id = player1_id),
    COUNT(*) FILTER (WHERE mr.winner_id = player2_id),
    COUNT(*),
    AVG(mr.duration_minutes)
  INTO player1_wins, player2_wins, total_matches, avg_match_duration
  FROM public.match_results mr
  JOIN public.match_requests mreq ON mr.match_request_id = mreq.id
  WHERE mr.status = 'verified'
    AND (
      (mreq.requester_id = player1_id AND mreq.requested_id = player2_id) OR
      (mreq.requester_id = player2_id AND mreq.requested_id = player1_id)
    );

  -- Build result JSON
  result := json_build_object(
    'player1_wins', player1_wins,
    'player2_wins', player2_wins,
    'total_matches', total_matches,
    'avg_match_duration_minutes', COALESCE(avg_match_duration, 0)
  );
  
  RETURN result;
END;
$$;

-- Function to get overall player stats
CREATE OR REPLACE FUNCTION public.get_player_stats(player_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  total_wins INTEGER := 0;
  total_losses INTEGER := 0;
  total_matches INTEGER := 0;
  win_percentage DECIMAL := 0;
  longest_win_streak INTEGER := 0;
  current_streak INTEGER := 0;
  result JSON;
BEGIN
  -- Get basic win/loss stats
  SELECT 
    COUNT(*) FILTER (WHERE mr.winner_id = player_id),
    COUNT(*) FILTER (WHERE mr.winner_id IS NOT NULL AND mr.winner_id != player_id),
    COUNT(*)
  INTO total_wins, total_losses, total_matches
  FROM public.match_results mr
  JOIN public.match_requests mreq ON mr.match_request_id = mreq.id
  WHERE mr.status = 'verified'
    AND (mreq.requester_id = player_id OR mreq.requested_id = player_id);

  -- Calculate win percentage
  IF total_matches > 0 THEN
    win_percentage := (total_wins::DECIMAL / total_matches::DECIMAL) * 100;
  END IF;

  -- Calculate longest win streak 
  WITH match_outcomes AS (
    SELECT 
      mr.completed_at,
      CASE WHEN mr.winner_id = player_id THEN 1 ELSE 0 END as is_win,
      ROW_NUMBER() OVER (ORDER BY mr.completed_at) as match_order
    FROM public.match_results mr
    JOIN public.match_requests mreq ON mr.match_request_id = mreq.id
    WHERE mr.status = 'verified'
      AND (mreq.requester_id = player_id OR mreq.requested_id = player_id)
      AND mr.winner_id IS NOT NULL
    ORDER BY mr.completed_at
  ),
  streaks AS (
    SELECT 
      is_win,
      match_order - ROW_NUMBER() OVER (PARTITION BY is_win ORDER BY match_order) as streak_group
    FROM match_outcomes
  ),
  win_streaks AS (
    SELECT COUNT(*) as streak_length
    FROM streaks 
    WHERE is_win = 1
    GROUP BY streak_group
  )
  SELECT COALESCE(MAX(streak_length), 0) INTO longest_win_streak FROM win_streaks;

  -- Build result JSON
  result := json_build_object(
    'total_wins', total_wins,
    'total_losses', total_losses,
    'total_matches', total_matches,
    'win_percentage', ROUND(win_percentage, 1),
    'longest_win_streak', longest_win_streak
  );
  
  RETURN result;
END;
$$;

-- Enhanced function to update player rating with streak tracking
CREATE OR REPLACE FUNCTION public.update_player_rating_with_streaks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  rating_adjustment DECIMAL(2,1);
  current_rating DECIMAL(2,1);
  streak_count INTEGER;
  should_adjust_rating BOOLEAN := FALSE;
  new_rating DECIMAL(2,1);
BEGIN
  -- Only process 'harder' or 'easier' assessments
  IF NEW.skill_assessment NOT IN ('harder', 'easier') THEN
    RETURN NEW;
  END IF;

  -- Get current rating of the rated player
  SELECT up.current_rating INTO current_rating
  FROM public.user_profiles up
  WHERE up.id = NEW.rated_player_id;

  -- Update or create streak record
  INSERT INTO public.skill_assessment_streaks (player_id, assessment_type, consecutive_count, last_assessment_date)
  VALUES (NEW.rated_player_id, NEW.skill_assessment, 1, now())
  ON CONFLICT (player_id, assessment_type)
  DO UPDATE SET 
    consecutive_count = skill_assessment_streaks.consecutive_count + 1,
    last_assessment_date = now(),
    updated_at = now();

  -- Reset opposite streak
  DELETE FROM public.skill_assessment_streaks 
  WHERE player_id = NEW.rated_player_id 
    AND assessment_type = CASE WHEN NEW.skill_assessment = 'harder' THEN 'easier' ELSE 'harder' END;

  -- Get current streak count
  SELECT consecutive_count INTO streak_count
  FROM public.skill_assessment_streaks
  WHERE player_id = NEW.rated_player_id AND assessment_type = NEW.skill_assessment;

  -- Check if we should adjust rating (3 consecutive assessments)
  IF streak_count >= 3 THEN
    should_adjust_rating := TRUE;
    
    -- Calculate rating adjustment
    CASE NEW.skill_assessment
      WHEN 'easier' THEN rating_adjustment := -0.5;
      WHEN 'harder' THEN rating_adjustment := 0.5;
    END CASE;

    -- Calculate new rating (keep within 1.0-5.0 range)
    new_rating := GREATEST(1.0, LEAST(5.0, current_rating + rating_adjustment));

    -- Update the player's rating
    UPDATE public.user_profiles
    SET 
      current_rating = new_rating,
      updated_at = now()
    WHERE id = NEW.rated_player_id;

    -- Record rating change in history
    INSERT INTO public.rating_history (player_id, old_rating, new_rating, reason, triggered_by_rating_id)
    VALUES (NEW.rated_player_id, current_rating, new_rating, 'skill_assessment', NEW.id);

    -- Reset the streak since we've applied the adjustment
    DELETE FROM public.skill_assessment_streaks 
    WHERE player_id = NEW.rated_player_id AND assessment_type = NEW.skill_assessment;

    -- Create notification for rating change
    INSERT INTO public.push_notifications (user_id, title, body, type, data)
    VALUES (
      NEW.rated_player_id,
      'NTRP Rating Updated',
      CASE 
        WHEN rating_adjustment > 0 THEN 'Your NTRP rating has increased to ' || new_rating || ' based on recent match feedback!'
        ELSE 'Your NTRP rating has been adjusted to ' || new_rating || ' based on recent match feedback.'
      END,
      'general',
      json_build_object('old_rating', current_rating, 'new_rating', new_rating, 'reason', 'skill_assessment')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Replace the old trigger
DROP TRIGGER IF EXISTS on_player_rating_created ON public.player_ratings;
CREATE TRIGGER on_player_rating_created
  AFTER INSERT ON public.player_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_player_rating_with_streaks();
