
-- Create circles table
CREATE TABLE public.circles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  member_count INTEGER NOT NULL DEFAULT 1
);

-- Create circle_members table
CREATE TABLE public.circle_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Create circle_messages table for real-time messaging
CREATE TABLE public.circle_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create circle_invitations table for private circles
CREATE TABLE public.circle_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users NOT NULL,
  invitee_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(circle_id, invitee_id)
);

-- Enable Row Level Security
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circles
CREATE POLICY "Users can view public circles or circles they're members of" 
  ON public.circles 
  FOR SELECT 
  USING (
    NOT is_private OR 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circles.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create circles" 
  ON public.circles 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Circle creators can update their circles" 
  ON public.circles 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Circle creators can delete their circles" 
  ON public.circles 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- RLS Policies for circle_members
CREATE POLICY "Users can view members of circles they belong to" 
  ON public.circle_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members cm 
      WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public circles" 
  ON public.circle_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    (
      EXISTS (
        SELECT 1 FROM public.circles 
        WHERE id = circle_id AND NOT is_private
      ) OR
      EXISTS (
        SELECT 1 FROM public.circle_invitations 
        WHERE circle_id = circle_members.circle_id 
        AND invitee_id = auth.uid() 
        AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can leave circles they're members of" 
  ON public.circle_members 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for circle_messages
CREATE POLICY "Circle members can view messages" 
  ON public.circle_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Circle members can send messages" 
  ON public.circle_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for circle_invitations
CREATE POLICY "Users can view invitations sent to them or by them" 
  ON public.circle_invitations 
  FOR SELECT 
  USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "Circle members can invite others to private circles" 
  ON public.circle_invitations 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = inviter_id AND 
    EXISTS (
      SELECT 1 FROM public.circle_members 
      WHERE circle_id = circle_invitations.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invitation status" 
  ON public.circle_invitations 
  FOR UPDATE 
  USING (auth.uid() = invitee_id);

-- Function to update member count when members join/leave
CREATE OR REPLACE FUNCTION update_circle_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circles 
    SET member_count = member_count + 1 
    WHERE id = NEW.circle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circles 
    SET member_count = member_count - 1 
    WHERE id = OLD.circle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically update member count
CREATE TRIGGER update_member_count_on_join
  AFTER INSERT ON public.circle_members
  FOR EACH ROW EXECUTE FUNCTION update_circle_member_count();

CREATE TRIGGER update_member_count_on_leave
  AFTER DELETE ON public.circle_members
  FOR EACH ROW EXECUTE FUNCTION update_circle_member_count();

-- Enable realtime for circle_messages
ALTER TABLE public.circle_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_messages;
